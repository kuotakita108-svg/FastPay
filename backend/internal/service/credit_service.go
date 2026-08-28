package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"kuotakita/backend/internal/database"
	"log"
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

// ErrCreditPersistence distinguishes an internal persistence failure from an
// authentication or validation error at the HTTP boundary.
var ErrCreditPersistence = errors.New("data kredit belum dapat disimpan ke server")

var ErrCreditNotFound = errors.New("pengajuan kredit tidak ditemukan")

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

// ListSummary omits embedded photo/file payloads. Full documents are loaded
// only when an application is opened, keeping the operator list response small.
func (s *CreditService) ListSummary(token string) ([]map[string]any, error) {
	items, err := s.List(token)
	if err != nil {
		return nil, err
	}
	for index, item := range items {
		items[index] = stripCreditPayload(item).(map[string]any)
	}
	return items, nil
}

func (s *CreditService) Get(token, id string) (map[string]any, error) {
	id = strings.TrimSpace(id)
	items, err := s.List(token)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		if stringValue(item["id"]) == id {
			return item, nil
		}
	}
	return nil, ErrCreditNotFound
}

func stripCreditPayload(value any) any {
	switch current := value.(type) {
	case map[string]any:
		out := make(map[string]any, len(current))
		for key, child := range current {
			if text, ok := child.(string); ok && isEmbeddedCreditPayload(strings.ToLower(key), text) {
				continue
			}
			out[key] = stripCreditPayload(child)
		}
		return out
	case []any:
		out := make([]any, len(current))
		for index, child := range current {
			out[index] = stripCreditPayload(child)
		}
		return out
	default:
		return current
	}
}

func isEmbeddedCreditPayload(key, value string) bool {
	if !strings.HasPrefix(value, "data:") && len(value) < 4096 {
		return false
	}
	switch key {
	case "image", "dataurl", "base64", "content", "filedata", "proofdata":
		return true
	default:
		return false
	}
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
				return nil, errors.New("agent masih memiliki fasilitas modal aktif; pengajuan baru hanya tersedia setelah kemitraan diakhiri")
			}
		}
	}
	if !exists && selectedAgentID != "" {
		for _, existing := range s.rows {
			if stringValue(existing["_owner_id"]) == selectedAgentID && blocksNewCredit(existing) {
				return nil, errors.New("agent masih memiliki fasilitas modal aktif; pengajuan baru hanya tersedia setelah kemitraan diakhiri")
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
		log.Printf("credit application %s persistence failed: %v", id, err)
		return nil, ErrCreditPersistence
	}
	return publicCredit(row), nil
}

// ReviewDocument updates only one document review state. Keeping this as a
// small server-side mutation avoids resending the complete application (and
// its base64 images) whenever an Operator approves or rejects a document.
func (s *CreditService) ReviewDocument(token, id, documentKey, status string) (map[string]any, error) {
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return nil, err
	}
	if !isOperatorRole(user.Role) {
		return nil, fmt.Errorf("%w: pemeriksaan dokumen hanya dapat dilakukan Operator", ErrForbidden)
	}
	id = strings.TrimSpace(id)
	documentKey = strings.TrimSpace(documentKey)
	status = strings.ToUpper(strings.TrimSpace(status))
	if id == "" || documentKey == "" {
		return nil, errors.New("pengajuan atau dokumen tidak valid")
	}
	if status != "APPROVED" && status != "REJECTED" {
		return nil, errors.New("status pemeriksaan dokumen tidak valid")
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	current, exists := s.rows[id]
	if !exists {
		return nil, errors.New("pengajuan kredit tidak ditemukan")
	}
	documents, ok := current["documents"].(map[string]any)
	if !ok {
		return nil, errors.New("dokumen pengajuan tidak ditemukan")
	}
	rawDocument, exists := documents[documentKey]
	if !exists {
		return nil, errors.New("dokumen pengajuan tidak ditemukan")
	}
	document, ok := rawDocument.(map[string]any)
	if !ok {
		return nil, errors.New("format dokumen pengajuan tidak valid")
	}

	previous := cloneCredit(current)
	updatedDocument := cloneCredit(document)
	updatedDocument["status"] = status
	updatedDocument["reviewedAt"] = time.Now().UTC().Format(time.RFC3339)
	updatedDocument["reviewedBy"] = user.Name
	documents[documentKey] = updatedDocument
	current["documents"] = documents
	current["updatedAt"] = time.Now().UTC().Format(time.RFC3339)
	if err := s.saveLocked(); err != nil {
		s.rows[id] = previous
		log.Printf("credit application %s document review persistence failed: %v", id, err)
		return nil, ErrCreditPersistence
	}
	return publicCredit(current), nil
}

// RecordPayment records a verified refill of an Agent's revolving capital.
// Payments are allocated FIFO to the Agent's oldest active facilities. The
// verified amount then becomes a new revolving facility, so the partnership
// remains active while each historical cycle keeps an accurate paid balance.
func (s *CreditService) RecordPayment(token, id string, input map[string]any) (map[string]any, error) {
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return nil, err
	}
	if !isOperatorRole(user.Role) {
		return nil, fmt.Errorf("%w: pembayaran hanya dapat dicatat Operator", ErrForbidden)
	}
	id = strings.TrimSpace(id)
	amount := intValue(input["amount"])
	if id == "" || amount <= 0 {
		return nil, errors.New("nominal pembayaran harus lebih dari Rp 0")
	}
	for _, key := range []string{"transferredAt", "destinationBank", "destinationAccountNumber", "destinationAccountName", "senderName"} {
		if strings.TrimSpace(stringValue(input[key])) == "" {
			return nil, errors.New("data transfer wajib dilengkapi")
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	current, exists := s.rows[id]
	if !exists {
		return nil, errors.New("pengajuan kredit tidak ditemukan")
	}
	ownerID := stringValue(current["_owner_id"])
	requestID := strings.TrimSpace(stringValue(input["requestId"]))
	for _, candidate := range s.rows {
		if stringValue(candidate["_owner_id"]) != ownerID {
			continue
		}
		history, _ := candidate["paymentHistory"].([]any)
		for _, raw := range history {
			entry, _ := raw.(map[string]any)
			if requestID != "" && stringValue(entry["requestId"]) == requestID {
				paymentID := stringValue(entry["id"])
				for _, revolving := range s.rows {
					if stringValue(revolving["_owner_id"]) == ownerID && stringValue(revolving["revolvingFromPaymentId"]) == paymentID {
						return publicCredit(revolving), nil
					}
				}
				return publicCredit(candidate), nil
			}
		}
	}
	if stringValue(current["status"]) != "Disetujui" {
		return nil, errors.New("pembayaran hanya dapat dicatat untuk kredit yang disetujui")
	}
	if stringValue(current["partnershipStatus"]) == "PARTNERSHIP_ENDED" {
		return nil, errors.New("kemitraan agent sudah diakhiri")
	}

	active := make([]map[string]any, 0)
	for _, candidate := range s.rows {
		if stringValue(candidate["_owner_id"]) != ownerID || stringValue(candidate["status"]) != "Disetujui" || stringValue(candidate["partnershipStatus"]) == "PARTNERSHIP_ENDED" {
			continue
		}
		if intValue(candidate["capitalOutstanding"]) > 0 {
			active = append(active, candidate)
		}
	}
	sort.Slice(active, func(i, j int) bool {
		left, right := stringValue(active[i]["createdAt"]), stringValue(active[j]["createdAt"])
		if left == right {
			return stringValue(active[i]["id"]) < stringValue(active[j]["id"])
		}
		return left < right
	})
	if len(active) == 0 {
		return nil, errors.New("limit modal aktif belum tersedia")
	}

	now := time.Now().UTC().Format(time.RFC3339)
	paymentID := fmt.Sprintf("PAY-%d", time.Now().UnixNano())
	basePayment := map[string]any{
		"id":                       paymentID,
		"amount":                   amount,
		"transferredAt":            strings.TrimSpace(stringValue(input["transferredAt"])),
		"destinationBank":          strings.TrimSpace(stringValue(input["destinationBank"])),
		"destinationAccountNumber": strings.TrimSpace(stringValue(input["destinationAccountNumber"])),
		"destinationAccountName":   strings.TrimSpace(stringValue(input["destinationAccountName"])),
		"senderName":               strings.TrimSpace(stringValue(input["senderName"])),
		"note":                     strings.TrimSpace(stringValue(input["note"])),
		"proof":                    cloneValue(input["proof"]),
		"status":                   "Terverifikasi",
		"recordedAt":               now,
		"recordedBy":               user.Name,
		"requestId":                requestID,
		"transferAmount":           amount,
	}

	backups := make(map[string]map[string]any, len(active))
	remainingPayment := amount
	for _, candidate := range active {
		if remainingPayment <= 0 {
			break
		}
		candidateID := stringValue(candidate["id"])
		backups[candidateID] = cloneCredit(candidate)
		row := cloneCredit(candidate)
		before := intValue(row["capitalOutstanding"])
		allocated := remainingPayment
		if allocated > before {
			allocated = before
		}
		after := before - allocated
		payment := cloneCredit(basePayment)
		payment["amount"] = allocated
		payment["allocatedAmount"] = allocated
		payment["facilityId"] = candidateID
		payment["capitalBefore"] = before
		payment["capitalAfter"] = after
		history, _ := row["paymentHistory"].([]any)
		row["paymentHistory"] = append([]any{payment}, history...)
		row["paidAmount"] = intValue(row["paidAmount"]) + allocated
		row["capitalOutstanding"] = after
		row["lastPaymentAt"] = now
		row["updatedAt"] = now
		if after == 0 {
			row["status"] = "Lunas"
			row["paymentStatus"] = "Lunas"
			row["capitalStatus"] = "Lunas"
			row["settledAt"] = now
		} else {
			row["paymentStatus"] = "Aktif"
			row["capitalStatus"] = "Aktif"
		}
		s.rows[candidateID] = row
		remainingPayment -= allocated
	}

	// Every verified payment opens the next revolving cycle for exactly the
	// transferred amount. Thus Rp600.000 paid against Rp500.000 + Rp500.000
	// closes the first cycle, pays Rp100.000 on the second and opens Rp600.000.
	revolvingID := fmt.Sprintf("RAL-REV-%X", time.Now().UnixNano())
	revolving := cloneCredit(current)
	revolving["id"] = revolvingID
	revolving["status"] = "Disetujui"
	revolving["approvedCapital"] = amount
	revolving["capitalOriginalAmount"] = amount
	revolving["capitalOutstanding"] = amount
	revolving["paidAmount"] = int64(0)
	revolving["paymentHistory"] = []any{}
	revolving["paymentStatus"] = "Aktif"
	revolving["capitalStatus"] = "Aktif"
	revolving["revolvingCycle"] = maxInt64(1, intValue(current["revolvingCycle"])) + 1
	revolving["revolvingFromPaymentId"] = paymentID
	revolving["revolvingFromApplicationId"] = id
	revolving["reviewNote"] = "Kredit bergulir otomatis dari pembayaran " + id
	revolving["capitalDisbursedAt"] = now
	revolving["capitalDisbursedBy"] = user.Name
	revolving["createdAt"] = now
	revolving["updatedAt"] = now
	for _, key := range []string{"settledAt", "lastPaymentAt", "lastCycleClosedAt", "partnershipEndedAt"} {
		delete(revolving, key)
	}
	if form, ok := revolving["form"].(map[string]any); ok {
		form["amount"] = amount
	}
	s.rows[revolvingID] = revolving

	// The verified transfer replenishes spendable capital. This is deliberately
	// done server-side so refreshing or changing the browser cannot mint funds.
	if _, err := s.auth.ChangeBalanceByUserID(ownerID, amount); err != nil {
		for backupID, backup := range backups {
			s.rows[backupID] = backup
		}
		delete(s.rows, revolvingID)
		return nil, fmt.Errorf("saldo modal belum dapat diisi kembali: %w", err)
	}
	if err := s.saveLocked(); err != nil {
		for backupID, backup := range backups {
			s.rows[backupID] = backup
		}
		delete(s.rows, revolvingID)
		_, _ = s.auth.ChangeBalanceByUserID(ownerID, -amount)
		return nil, errors.New("pembayaran belum dapat disimpan ke server")
	}
	return publicCredit(revolving), nil
}

func maxInt64(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
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
	if stringValue(row["partnershipStatus"]) == "PARTNERSHIP_ENDED" {
		return false
	}
	// An approved facility may receive a limit-increase application. Only an
	// unfinished decision blocks another submission, preventing duplicate
	// pending requests without stopping revolving capital growth.
	switch stringValue(row["status"]) {
	case "Ditolak", "Disetujui", "Lunas":
		return false
	default:
		return true
	}
}

func protectCreditDecisionFields(target, source map[string]any) {
	for _, key := range []string{
		"creditLimit", "creditTier", "creditBadge", "automaticCreditLimit", "automaticCreditTier",
		"manualCreditLimit", "manualCreditTier", "manualCreditBadge", "manualLimitAt", "manualLimitBy",
		"capitalLimit", "approvedCapital", "capitalOutstanding", "capitalOriginalAmount", "capitalStatus",
		"paidAmount", "paymentHistory", "paymentStatus", "revolvingCycle", "lastPaymentAt", "lastCycleClosedAt",
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
