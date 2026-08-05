package service

import (
	"encoding/json"
	"errors"
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
		// Marketing only works with agents that it registered or surveyed. Older
		// records without a marketing id remain visible while they are migrated.
		if user.Role == "marketing" {
			marketingID := stringValue(row["marketingId"])
			if marketingID != "" && marketingID != user.ID {
				continue
			}
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
	id := strings.TrimSpace(stringValue(input["id"]))
	if id == "" {
		return nil, errors.New("id pengajuan tidak valid")
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	current, exists := s.rows[id]
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
		if user.Role == "agent" {
			row["userId"] = user.ID
			row["userName"] = user.Name
		}
		if user.Role == "marketing" {
			row["marketingId"] = user.ID
			row["marketingName"] = user.Name
		}
	}
	// The browser sends the complete application object. Never let a regular
	// agent or marketing account turn that into an approval, a limit change or
	// a settled payment by editing values in the browser.
	if exists && !isOperatorRole(user.Role) {
		protectCreditDecisionFields(row, current)
		if user.Role == "marketing" {
			row["marketingId"] = stringValue(current["marketingId"])
			if row["marketingId"] == "" {
				row["marketingId"] = user.ID
			}
			row["marketingName"] = user.Name
			// Marketing can only forward a complete field survey to Operator.
			if stringValue(row["status"]) == "Disetujui" || stringValue(row["status"]) == "Ditolak" {
				row["status"] = current["status"]
			}
		}
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
		if user.Role == "marketing" {
			row["status"] = "Menunggu verifikasi marketing"
		}
	}
	row["id"] = id
	if strings.TrimSpace(stringValue(row["createdAt"])) == "" {
		row["createdAt"] = time.Now().UTC().Format(time.RFC3339)
	}
	row["updatedAt"] = time.Now().UTC().Format(time.RFC3339)
	s.rows[id] = row
	if err := s.saveLocked(); err != nil {
		return nil, errors.New("data kredit belum dapat disimpan ke server")
	}
	return publicCredit(row), nil
}

// SpendAvailableCredit is called by the transaction API after the agent's
// main wallet has been exhausted. Credit balance represents remaining usable
// capacity, while creditOutstanding represents the one bill that must be paid
// in full at the due date.
func (s *CreditService) SpendAvailableCredit(token string, amount int64) (int64, error) {
	if amount <= 0 {
		return 0, nil
	}
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return 0, err
	}
	if user.Role != "agent" {
		return 0, errors.New("saldo kredit hanya tersedia untuk akun agent")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	var selected map[string]any
	for _, row := range s.rows {
		if stringValue(row["_owner_id"]) != user.ID || stringValue(row["status"]) != "Disetujui" {
			continue
		}
		if stringValue(row["paymentStatus"]) == "Lunas" || stringValue(row["agentAccessStatus"]) == "Ditangguhkan" {
			continue
		}
		if selected == nil || stringValue(row["updatedAt"]) > stringValue(selected["updatedAt"]) {
			selected = row
		}
	}
	if selected == nil {
		return 0, errors.New("saldo kredit belum aktif")
	}
	available := intValue(selected["creditBalance"])
	if available < amount {
		return 0, errors.New("saldo utama dan saldo kredit tidak mencukupi")
	}
	selected["creditBalance"] = available - amount
	selected["creditOutstanding"] = intValue(selected["creditOutstanding"]) + amount
	selected["creditStatus"] = "Digunakan"
	selected["paymentStatus"] = "Belum lunas"
	selected["updatedAt"] = time.Now().UTC().Format(time.RFC3339)
	if err := s.saveLocked(); err != nil {
		return 0, errors.New("pemakaian saldo kredit belum dapat disimpan")
	}
	return intValue(selected["creditBalance"]), nil
}

func canWorkWithCredit(role string) bool {
	return role == "agent" || role == "marketing" || role == "operator" || role == "analis" || role == "master" || role == "admin"
}

func isOperatorRole(role string) bool {
	return role == "operator" || role == "analis" || role == "master" || role == "admin"
}

func protectCreditDecisionFields(target, source map[string]any) {
	for _, key := range []string{
		"creditLimit", "creditTier", "creditBadge", "automaticCreditLimit", "automaticCreditTier",
		"manualCreditLimit", "manualCreditTier", "manualCreditBadge", "manualLimitAt", "manualLimitBy",
		"creditLimitSource", "creditBalance", "creditOutstanding", "creditOriginalAmount", "creditStatus",
		"dueAt", "settledAt", "decidedAt", "analysisDecision", "analisSignature", "operatorSignature",
		"agentAccessStatus", "agentAccessReason", "agentAccessUpdatedAt",
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
