package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"kuotakita/backend/internal/database"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// CreditService is the server source of truth for agent-credit applications.
// The frontend may cache for display, but all writes are stored in the
// persistent Docker volume so they are available to agent, marketing and analis.
type CreditService struct {
	path  string
	auth  *AuthService
	state *database.StateStore
	mu    sync.RWMutex
	rows  map[string]map[string]any
}

type creditFile struct {
	Applications []map[string]any `json:"applications"`
}

// ErrForbidden marks an authenticated request that is outside the role's
// authority. HTTP handlers translate it to 403 Forbidden.
var ErrForbidden = errors.New("akses ditolak")

func NewCreditService(path string, auth *AuthService) *CreditService {
	return NewDatabaseCreditService(path, auth, nil)
}

func NewDatabaseCreditService(path string, auth *AuthService, state *database.StateStore) *CreditService {
	s := &CreditService{path: path, auth: auth, state: state, rows: map[string]map[string]any{}}
	if err := s.load(); err != nil {
		panic(err)
	}
	return s
}

func (s *CreditService) List(token string) ([]map[string]any, error) {
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]map[string]any, 0, len(s.rows))
	for _, row := range s.rows {
		if user.Role == "agent" && stringValue(row["_owner_id"]) != user.ID {
			continue
		}
		// Marketing only sees its own portfolio. Unassigned legacy records stay
		// available to Operator/Admin and never leak to a new Marketing account.
		if user.Role == "marketing" {
			marketingID := stringValue(row["marketingId"])
			if marketingID == "" {
				marketingID = stringValue(row["marketingOwnerId"])
			}
			if marketingID != user.ID {
				continue
			}
		}
		if user.Role == "marketing" {
			result = append(result, marketingCredit(row))
			continue
		}
		result = append(result, publicCredit(row))
	}
	sort.Slice(result, func(i, j int) bool { return stringValue(result[i]["updatedAt"]) > stringValue(result[j]["updatedAt"]) })
	return result, nil
}

func (s *CreditService) Save(token string, input map[string]any) (map[string]any, error) {
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return nil, err
	}
	if user.Role == "marketing" {
		return nil, fmt.Errorf("%w: pengajuan modal dibuat Agent dan diputuskan Operator", ErrForbidden)
	}
	id := strings.TrimSpace(stringValue(input["id"]))
	if id == "" {
		return nil, errors.New("id pengajuan tidak valid")
	}
	var selectedAgentID string
	var selectedAgentName string
	var selectedAgentStore string
	var selectedAgentPhone string
	var selectedAgentEmail string
	if isOperatorRole(user.Role) {
		selectedAgentID = strings.TrimSpace(stringValue(input["userId"]))
		if selectedAgentID != "" {
			agent, resolveErr := s.auth.ResolveManagedAgent(token, selectedAgentID)
			if resolveErr != nil {
				return nil, resolveErr
			}
			selectedAgentName, selectedAgentStore = agent.Name, agent.StoreName
			selectedAgentPhone, selectedAgentEmail = agent.Phone, agent.Email
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	current, exists := s.rows[id]
	if !exists && user.Role == "agent" {
		for _, existing := range s.rows {
			if stringValue(existing["_owner_id"]) == user.ID && blocksNewCredit(existing) {
				return nil, errors.New("agent masih memiliki pengajuan atau kredit aktif; lunasi kredit sebelum mengajukan kembali")
			}
		}
	}
	if !exists && selectedAgentID != "" {
		for _, existing := range s.rows {
			if stringValue(existing["_owner_id"]) == selectedAgentID && blocksNewCredit(existing) {
				return nil, errors.New("agent masih memiliki pengajuan atau kredit aktif; lunasi kredit sebelum mengajukan kembali")
			}
		}
	}
	if exists && user.Role == "agent" && stringValue(current["_owner_id"]) != user.ID {
		return nil, errors.New("pengajuan ini bukan milik agent")
	}
	if !exists && !canWorkWithCredit(user.Role) {
		return nil, errors.New("akun tidak memiliki akses kredit")
	}

	row := cloneCredit(input)
	if exists {
		// Preserve ownership even when a reviewer updates status, signature, or cicilan.
		row["_owner_id"] = current["_owner_id"]
	} else {
		row["_owner_id"] = user.ID
		if selectedAgentID != "" {
			row["_owner_id"] = selectedAgentID
			row["userId"] = selectedAgentID
			row["userName"] = selectedAgentName
			if form, ok := row["form"].(map[string]any); ok {
				form["agentName"] = selectedAgentName
				form["storeName"] = selectedAgentStore
				form["whatsapp"] = selectedAgentPhone
				form["email"] = selectedAgentEmail
			}
		}
		if user.Role == "agent" {
			row["userId"] = user.ID
			row["userName"] = user.Name
			if managerID, managerName := s.auth.ManagerForUser(user.ID); managerID != "" {
				row["marketingId"] = managerID
				row["marketingName"] = managerName
			}
		}
	}
	// The browser sends the complete application object. Never let a regular
	// agent or marketing account turn that into an approval, a limit change or
	// a settled payment by editing values in the browser.
	if exists && !isOperatorRole(user.Role) {
		protectCreditDecisionFields(row, current)
		if user.Role == "agent" {
			row["userId"] = current["userId"]
			row["userName"] = current["userName"]
		}
	}
	if !exists && !isOperatorRole(user.Role) {
		// A new browser request is never allowed to manufacture an approved
		// credit facility. Approval, balance and limit are Operator-only.
		delete(row, "creditLimit")
		delete(row, "creditBalance")
		delete(row, "creditOutstanding")
		delete(row, "creditOriginalAmount")
		delete(row, "creditTier")
		delete(row, "creditBadge")
		row["paymentStatus"] = "Belum ada tagihan"
		row["creditStatus"] = "Menunggu keputusan"
		row["status"] = "Menunggu keputusan operator"
	}

	// Modal uses the existing Saldo Utama. On the first Operator approval the
	// approved amount is deposited once; only its liability is tracked here.
	shouldDisburse := exists && isOperatorRole(user.Role) &&
		stringValue(current["status"]) != "Disetujui" && stringValue(row["status"]) == "Disetujui" &&
		strings.TrimSpace(stringValue(current["capitalDisbursedAt"])) == ""
	disbursedAmount := int64(0)
	if shouldDisburse {
		disbursedAmount = approvedCapitalAmount(row)
		if disbursedAmount <= 0 {
			return nil, errors.New("nominal pencairan modal harus lebih dari Rp 0")
		}
		ownerID := stringValue(current["_owner_id"])
		if _, err := s.auth.ChangeBalanceByUserID(ownerID, disbursedAmount); err != nil {
			return nil, fmt.Errorf("pencairan ke saldo utama gagal: %w", err)
		}
		row["capitalOutstanding"] = disbursedAmount
		row["capitalOriginalAmount"] = disbursedAmount
		row["capitalDisbursedAt"] = time.Now().UTC().Format(time.RFC3339)
		row["capitalDisbursedBy"] = user.Name
		delete(row, "creditBalance")
		delete(row, "creditOutstanding")
	}
	row["id"] = id
	// Reject the old conventional-loan shape even when an outdated browser
	// submits it. KuotaKita keeps one wallet and a separate capital liability.
	for _, key := range []string{"creditBalance", "creditOutstanding", "dueAt", "repayments", "installments", "settledAt", "lastFullPaymentAt"} {
		delete(row, key)
	}
	if strings.TrimSpace(stringValue(row["createdAt"])) == "" {
		row["createdAt"] = time.Now().UTC().Format(time.RFC3339)
	}
	row["updatedAt"] = time.Now().UTC().Format(time.RFC3339)
	s.rows[id] = row
	if err := s.saveLocked(); err != nil {
		if exists {
			s.rows[id] = current
		} else {
			delete(s.rows, id)
		}
		if disbursedAmount > 0 {
			_, _ = s.auth.ChangeBalanceByUserID(stringValue(row["_owner_id"]), -disbursedAmount)
		}
		return nil, errors.New("data kredit belum dapat disimpan ke server")
	}
	return publicCredit(row), nil
}

func canWorkWithCredit(role string) bool {
	return role == "agent" || role == "operator" || role == "analis" || role == "master" || role == "admin"
}

func approvedCapitalAmount(row map[string]any) int64 {
	for _, key := range []string{"approvedCapital", "capitalApproved", "capitalLimit", "creditLimit"} {
		if amount := intValue(row[key]); amount > 0 {
			return amount
		}
	}
	if form, ok := row["form"].(map[string]any); ok {
		return intValue(form["amount"])
	}
	return 0
}

func isOperatorRole(role string) bool {
	return role == "operator" || role == "analis" || role == "master" || role == "admin"
}

func blocksNewCredit(row map[string]any) bool {
	if stringValue(row["status"]) == "Ditolak" {
		return false
	}
	return stringValue(row["partnershipStatus"]) != "PARTNERSHIP_ENDED"
}

func protectCreditDecisionFields(target, source map[string]any) {
	for _, key := range []string{
		"creditLimit", "creditTier", "creditBadge", "automaticCreditLimit", "automaticCreditTier",
		"manualCreditLimit", "manualCreditTier", "manualCreditBadge", "manualLimitAt", "manualLimitBy",
		"capitalLimit", "approvedCapital", "capitalOutstanding", "capitalOriginalAmount", "capitalStatus",
		"dueAt", "settledAt", "decidedAt", "analysisDecision", "analisSignature", "operatorSignature",
		"agentAccessStatus", "agentAccessReason", "agentAccessUpdatedAt",
		"decisionHistory", "blacklistedAt", "blacklistedBy", "blacklistReason",
	} {
		if value, ok := source[key]; ok {
			target[key] = value
		} else {
			delete(target, key)
		}
	}
	// A payment proof is allowed, but its final status is always set by Operator.
	if stringValue(target["paymentStatus"]) == "Lunas" {
		target["paymentStatus"] = source["paymentStatus"]
	}
}

func (s *CreditService) load() error {
	if s.state != nil {
		var file creditFile
		found, err := s.state.Load("credit-applications", &file)
		if err != nil {
			return err
		}
		if found {
			for _, row := range file.Applications {
				if id := strings.TrimSpace(stringValue(row["id"])); id != "" {
					s.rows[id] = row
				}
			}
			return nil
		}
	}
	if err := os.MkdirAll(filepath.Dir(s.path), 0700); err != nil {
		return err
	}
	bytes, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		if s.state != nil {
			return s.state.Save("credit-applications", creditFile{Applications: s.allRows()})
		}
		return nil
	}
	if err != nil {
		return err
	}
	var file creditFile
	if err := json.Unmarshal(bytes, &file); err != nil {
		return err
	}
	for _, row := range file.Applications {
		if id := strings.TrimSpace(stringValue(row["id"])); id != "" {
			s.rows[id] = row
		}
	}
	if s.state != nil {
		return s.state.Save("credit-applications", creditFile{Applications: s.allRows()})
	}
	return nil
}

func (s *CreditService) saveLocked() error {
	items := s.allRows()
	if s.state != nil {
		return s.state.Save("credit-applications", creditFile{Applications: items})
	}
	bytes, err := json.MarshalIndent(creditFile{Applications: items}, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, bytes, 0600); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

func (s *CreditService) allRows() []map[string]any {
	items := make([]map[string]any, 0, len(s.rows))
	for _, row := range s.rows {
		items = append(items, row)
	}
	return items
}

func cloneCredit(value map[string]any) map[string]any {
	encoded, _ := json.Marshal(value)
	var cloned map[string]any
	_ = json.Unmarshal(encoded, &cloned)
	return cloned
}
func publicCredit(row map[string]any) map[string]any {
	out := cloneCredit(row)
	delete(out, "_owner_id")
	return out
}
func marketingCredit(row map[string]any) map[string]any {
	// Marketing only receives operational progress and field documents belonging
	// to agents it registered. Sensitive identity fields such as NIK and address
	// remain inside the Agent–Operator workflow.
	out := map[string]any{
		"id":            stringValue(row["id"]),
		"status":        stringValue(row["status"]),
		"userId":        stringValue(row["userId"]),
		"userName":      stringValue(row["userName"]),
		"marketingId":   stringValue(row["marketingId"]),
		"marketingName": stringValue(row["marketingName"]),
		"createdAt":     stringValue(row["createdAt"]),
		"updatedAt":     stringValue(row["updatedAt"]),
	}
	if form, ok := row["form"].(map[string]any); ok {
		out["form"] = map[string]any{
			"agentName": stringValue(form["agentName"]),
			"storeName": stringValue(form["storeName"]),
			"amount":    form["amount"],
			"purpose":   stringValue(form["purpose"]),
		}
	}
	for _, key := range []string{"documents", "agentConsent", "operatorDecision", "reviewNote", "note", "approvedCapital", "approvedAmount", "creditOriginalAmount", "paymentStatus", "partnershipStatus"} {
		if value, exists := row[key]; exists {
			out[key] = cloneValue(value)
		}
	}
	return out
}

func cloneValue(value any) any {
	encoded, _ := json.Marshal(value)
	var cloned any
	_ = json.Unmarshal(encoded, &cloned)
	return cloned
}
func stringValue(value any) string { text, _ := value.(string); return text }
func intValue(value any) int64 {
	switch number := value.(type) {
	case int64:
		return number
	case int:
		return int64(number)
	case float64:
		return int64(number)
	case json.Number:
		parsed, _ := number.Int64()
		return parsed
	}
	return 0
}
