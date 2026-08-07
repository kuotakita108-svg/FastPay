package handler

import (
	"encoding/json"
	"fmt"
	"kuotakita/backend/internal/database"
	"kuotakita/backend/internal/domain"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// UserTransactionHandler persists wallet history in the same server volume as
// accounts and credit data. Browser history is only a receipt cache.
type UserTransactionHandler struct {
	mu       sync.RWMutex
	items    map[string][]domain.Transaction
	auth     *service.AuthService
	dataFile string
	state    *database.StateStore
	credit   *service.CreditService
	pulsa24  *service.Pulsa24Service
}

type transactionFile struct {
	Items map[string][]domain.Transaction `json:"items"`
}
type paymentInput struct {
	Title    string `json:"title"`
	Target   string `json:"target"`
	Provider string `json:"provider"`
	Product  string `json:"product"`
	Email    string `json:"email"`
	Amount   int64  `json:"amount"`
	SKU      string `json:"sku"`
	Qty      int64  `json:"qty"`
}

// Kept for backwards-compatible request decoding. Top-up is intentionally
// disabled until a verified QRIS/VA payment provider and webhook are active.
type topupInput struct {
	Amount int64  `json:"amount"`
	Method string `json:"method"`
}
type pulsa24InquiryInput struct {
	SKU    string `json:"sku"`
	Target string `json:"target"`
}

func NewUserTransactionHandler(auth *service.AuthService, dataFile string) *UserTransactionHandler {
	return NewDatabaseUserTransactionHandler(auth, dataFile, nil)
}

func NewDatabaseUserTransactionHandler(auth *service.AuthService, dataFile string, state *database.StateStore) *UserTransactionHandler {
	return NewDatabaseUserTransactionHandlerWithCredit(auth, dataFile, state, nil)
}

func NewDatabaseUserTransactionHandlerWithCredit(auth *service.AuthService, dataFile string, state *database.StateStore, credit *service.CreditService) *UserTransactionHandler {
	return NewDatabaseUserTransactionHandlerWithCreditAndP24(auth, dataFile, state, credit, nil)
}

func NewDatabaseUserTransactionHandlerWithCreditAndP24(auth *service.AuthService, dataFile string, state *database.StateStore, credit *service.CreditService, pulsa24 *service.Pulsa24Service) *UserTransactionHandler {
	h := &UserTransactionHandler{items: make(map[string][]domain.Transaction), auth: auth, dataFile: dataFile, state: state, credit: credit, pulsa24: pulsa24}
	_ = h.load()
	return h
}

func (h *UserTransactionHandler) userID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id, err := h.auth.UserID(r.Header.Get("Authorization"))
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return "", false
	}
	return id, true
}

func (h *UserTransactionHandler) List(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r)
	if !ok {
		return
	}
	h.mu.RLock()
	items := append([]domain.Transaction{}, h.items[id]...)
	h.mu.RUnlock()
	response.JSON(w, http.StatusOK, items)
}

func (h *UserTransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.userID(w, r); !ok {
		return
	}
	response.Error(w, http.StatusMethodNotAllowed, "pencatatan transaksi manual tidak diizinkan. Gunakan pembayaran produk melalui H2H Pulsa24Jam")
}

func (h *UserTransactionHandler) Payment(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r)
	if !ok {
		return
	}
	var in paymentInput
	if json.NewDecoder(r.Body).Decode(&in) != nil || in.Amount < 1 {
		response.Error(w, 400, "data pembayaran tidak valid")
		return
	}
	token := r.Header.Get("Authorization")
	current, err := h.auth.CurrentUser(token)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	// Browser clients must provide a real H2H SKU.  There is deliberately no
	// local-success fallback: P24 is the transaction authority.
	if strings.TrimSpace(in.SKU) == "" || strings.TrimSpace(in.Target) == "" {
		response.Error(w, http.StatusUnprocessableEntity, "produk H2H dan tujuan transaksi wajib diisi")
		return
	}
	if h.pulsa24 == nil || !h.pulsa24.Enabled() {
		response.Error(w, http.StatusServiceUnavailable, "transaksi H2H belum diaktifkan di server")
		return
	}
	user, mainUsed, creditUsed, err := h.chargeFunds(token, current, in.Amount)
	if err != nil {
		response.Error(w, 422, err.Error())
		return
	}
	method := strings.TrimSpace(strings.TrimSpace(in.Provider) + " · " + strings.TrimSpace(in.Title))
	now := time.Now()
	qty := in.Qty
	if qty < 1 {
		qty = in.Amount
	}
	refID := h.pulsa24.NewRefID()
	tx := domain.Transaction{ID: fmt.Sprintf("PP-%d", now.UnixMilli()), Customer: in.Target, Email: in.Email, Method: method, Amount: in.Amount, Status: "Diproses", Target: in.Target, Provider: in.Provider, Title: in.Title, Product: in.Product, OrderNumber: refID, CreatedAt: now}
	h.append(id, tx)
	if err := h.pulsa24.Record(service.Pulsa24Order{RefID: refID, UserID: id, Product: in.SKU, Destination: in.Target, TransactionID: tx.ID, Qty: qty, Amount: in.Amount, MainUsed: mainUsed, CreditUsed: creditUsed, Status: "pending", Debited: true, CreatedAt: now}); err != nil {
		h.restoreFunds(id, mainUsed, creditUsed)
		h.updateTransaction(id, tx.ID, "Gagal", "", "")
		response.Error(w, http.StatusServiceUnavailable, "order H2H tidak dapat disimpan")
		return
	}
	result, requestErr := h.pulsa24.Pay(in.SKU, in.Target, qty, refID)
	if requestErr != nil {
		// A parsed rejection from P24 is definitive even when its HTTP status is
		// non-2xx. Network/time-out errors remain pending because retrying PAY
		// could create a duplicate order; STATUS-PAY/callback will settle them.
		if result.Status == "failed" || result.Message != "" {
			result.Status = "failed"
			tx = h.finalizePulsa24(refID, result)
			h.writeFailedPaymentResponse(w, token, tx, mainUsed, creditUsed, result.Message)
			return
		}
		h.writePaymentResponseStatus(w, http.StatusAccepted, tx, user.Balance, mainUsed, creditUsed)
		return
	}
	if result.Status == "failed" {
		tx = h.finalizePulsa24(refID, result)
		h.writeFailedPaymentResponse(w, token, tx, mainUsed, creditUsed, result.Message)
		return
	}
	if result.Status == "success" {
		tx = h.finalizePulsa24(refID, result)
	}
	h.writePaymentResponseStatus(w, http.StatusAccepted, tx, user.Balance, mainUsed, creditUsed)
	return
}

func (h *UserTransactionHandler) writeFailedPaymentResponse(w http.ResponseWriter, token string, tx domain.Transaction, mainUsed, creditUsed int64, message string) {
	if strings.TrimSpace(message) == "" {
		message = "transaksi ditolak provider"
	}
	balance := int64(0)
	if current, err := h.auth.CurrentUser(token); err == nil {
		balance = current.Balance
	}
	funding := "Saldo Utama"
	if creditUsed > 0 && mainUsed > 0 {
		funding = "Saldo Utama + Saldo Kredit"
	} else if creditUsed > 0 {
		funding = "Saldo Kredit"
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"transaction": tx, "balance": balance, "main_used": mainUsed,
		"credit_used": creditUsed, "funding_source": funding,
		"refunded": true, "message": message,
	})
}

func (h *UserTransactionHandler) chargeFunds(token string, current domain.User, amount int64) (domain.User, int64, int64, error) {
	mainUsed := amount
	if current.Balance < mainUsed {
		mainUsed = current.Balance
	}
	if mainUsed < 0 {
		mainUsed = 0
	}
	creditUsed := amount - mainUsed
	if creditUsed > 0 {
		if current.Role != "agent" {
			return current, 0, 0, fmt.Errorf("saldo utama tidak mencukupi")
		}
		if h.credit == nil {
			return current, 0, 0, fmt.Errorf("saldo utama tidak mencukupi")
		}
		if _, err := h.credit.SpendAvailableCredit(token, creditUsed); err != nil {
			return current, 0, 0, err
		}
	}
	user := current
	if mainUsed > 0 {
		var err error
		user, err = h.auth.ChangeBalance(token, -mainUsed)
		if err != nil {
			if creditUsed > 0 {
				_ = h.credit.RestoreAvailableCredit(current.ID, creditUsed)
			}
			return current, 0, 0, err
		}
	}
	return user, mainUsed, creditUsed, nil
}

func (h *UserTransactionHandler) restoreFunds(userID string, mainUsed, creditUsed int64) {
	if mainUsed > 0 {
		_, _ = h.auth.ChangeBalanceByUserID(userID, mainUsed)
	}
	if creditUsed > 0 && h.credit != nil {
		_ = h.credit.RestoreAvailableCredit(userID, creditUsed)
	}
}

func (h *UserTransactionHandler) writePaymentResponse(w http.ResponseWriter, tx domain.Transaction, balance, mainUsed, creditUsed int64) {
	h.writePaymentResponseStatus(w, http.StatusCreated, tx, balance, mainUsed, creditUsed)
}

func (h *UserTransactionHandler) writePaymentResponseStatus(w http.ResponseWriter, status int, tx domain.Transaction, balance, mainUsed, creditUsed int64) {
	funding := "Saldo Utama"
	if creditUsed > 0 && mainUsed > 0 {
		funding = "Saldo Utama + Saldo Kredit"
	} else if creditUsed > 0 {
		funding = "Saldo Kredit"
	}
	response.JSON(w, status, map[string]any{"transaction": tx, "balance": balance, "main_used": mainUsed, "credit_used": creditUsed, "funding_source": funding})
}

func (h *UserTransactionHandler) updateTransaction(userID, transactionID, status, sn, customerName string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for i := range h.items[userID] {
		if h.items[userID][i].ID != transactionID {
			continue
		}
		h.items[userID][i].Status = status
		if sn != "" {
			h.items[userID][i].SN = sn
		}
		if customerName != "" {
			h.items[userID][i].CustomerName = customerName
		}
		break
	}
	_ = h.saveLocked()
}

func (h *UserTransactionHandler) transaction(userID, transactionID string) (domain.Transaction, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, transaction := range h.items[userID] {
		if transaction.ID == transactionID {
			return transaction, true
		}
	}
	return domain.Transaction{}, false
}

func (h *UserTransactionHandler) finalizePulsa24(refID string, result service.Pulsa24Result) domain.Transaction {
	order, found, err := h.pulsa24.Finalize(refID, result)
	if !found || err != nil {
		return domain.Transaction{}
	}
	status := "Diproses"
	switch result.Status {
	case "success":
		status = "Berhasil"
	case "failed":
		status = "Gagal"
		if refund, shouldRefund, refundErr := h.pulsa24.RefundOnce(refID); refundErr == nil && shouldRefund {
			h.restoreFunds(refund.UserID, refund.MainUsed, refund.CreditUsed)
		}
	}
	h.updateTransaction(order.UserID, order.TransactionID, status, result.SN, result.CustomerName)
	transaction, _ := h.transaction(order.UserID, order.TransactionID)
	return transaction
}

// Pulsa24Status verifies a recorded H2H order directly to P24. The browser
// never decides whether a pending transaction succeeded or failed.
func (h *UserTransactionHandler) Pulsa24Status(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.userID(w, r)
	if !ok {
		return
	}
	if h.pulsa24 == nil || !h.pulsa24.Enabled() {
		response.Error(w, http.StatusServiceUnavailable, "integrasi Pulsa24Jam belum aktif")
		return
	}
	refID := strings.TrimSpace(r.URL.Query().Get("refid"))
	order, found := h.pulsa24.Order(refID)
	if refID == "" || !found || order.UserID != userID {
		response.Error(w, http.StatusNotFound, "order H2H tidak ditemukan")
		return
	}
	result, err := h.pulsa24.Verify(order)
	if err != nil {
		response.Error(w, http.StatusBadGateway, "status transaksi belum dapat diverifikasi ke Pulsa24Jam")
		return
	}
	transaction, _ := h.transaction(order.UserID, order.TransactionID)
	if result.Status == "success" || result.Status == "failed" {
		transaction = h.finalizePulsa24(refID, result)
	}
	settledOrder, _ := h.pulsa24.Order(refID)
	balance := int64(0)
	if current, currentErr := h.auth.CurrentUser(r.Header.Get("Authorization")); currentErr == nil {
		balance = current.Balance
	}
	funding := "Saldo Utama"
	if settledOrder.CreditUsed > 0 && settledOrder.MainUsed > 0 {
		funding = "Saldo Utama + Saldo Kredit"
	} else if settledOrder.CreditUsed > 0 {
		funding = "Saldo Kredit"
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"transaction": transaction, "status": result.Status, "refid": refID,
		"balance": balance, "main_used": settledOrder.MainUsed,
		"credit_used": settledOrder.CreditUsed, "funding_source": funding,
		"refunded": settledOrder.Refunded, "message": result.Message,
	})
}

// Pulsa24Products lets logged-in users view the provider catalogue through
// KuotaKita's server without exposing the H2H API key or PIN.
func (h *UserTransactionHandler) Pulsa24Products(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.userID(w, r); !ok {
		return
	}
	if h.pulsa24 == nil || !h.pulsa24.Enabled() {
		response.Error(w, http.StatusServiceUnavailable, "integrasi Pulsa24Jam belum aktif")
		return
	}
	result, err := h.pulsa24.Products(strings.TrimSpace(r.URL.Query().Get("product")))
	if err != nil {
		response.Error(w, http.StatusBadGateway, "produk Pulsa24Jam belum dapat dimuat")
		return
	}
	response.JSON(w, http.StatusOK, result.Raw)
}

// Pulsa24Balance is for operational panels. The deposit balance belongs to
// KuotaKita, not the browser or an individual agent.
func (h *UserTransactionHandler) Pulsa24Balance(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.userID(w, r); !ok {
		return
	}
	if h.pulsa24 == nil || !h.pulsa24.Enabled() {
		response.Error(w, http.StatusServiceUnavailable, "integrasi Pulsa24Jam belum aktif")
		return
	}
	result, err := h.pulsa24.Balance()
	if err != nil {
		response.Error(w, http.StatusBadGateway, "saldo induk Pulsa24Jam belum dapat dimuat")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"balance": result.Balance, "updated_at": time.Now()})
}

// Pulsa24Inquiry is required before a postpaid payment. The amount returned
// by P24 is the only amount that may be submitted to PAY.
func (h *UserTransactionHandler) Pulsa24Inquiry(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.userID(w, r); !ok {
		return
	}
	if h.pulsa24 == nil || !h.pulsa24.Enabled() {
		response.Error(w, http.StatusServiceUnavailable, "integrasi Pulsa24Jam belum aktif")
		return
	}
	var in pulsa24InquiryInput
	if json.NewDecoder(r.Body).Decode(&in) != nil || strings.TrimSpace(in.SKU) == "" || strings.TrimSpace(in.Target) == "" {
		response.Error(w, http.StatusBadRequest, "produk H2H dan ID pelanggan wajib diisi")
		return
	}
	refID := h.pulsa24.NewRefID()
	result, err := h.pulsa24.Inquiry(in.SKU, in.Target, refID)
	if err != nil {
		response.Error(w, http.StatusBadGateway, "tagihan belum dapat dicek ke Pulsa24Jam")
		return
	}
	if result.Status == "failed" || result.Amount < 1 {
		message := result.Message
		if message == "" {
			message = "tagihan tidak ditemukan atau belum dapat diproses"
		}
		response.Error(w, http.StatusUnprocessableEntity, message)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"inquiry": map[string]any{"refid": refID, "status": result.Status, "message": result.Message, "amount": result.Amount, "data": result.Raw}})
}

// Pulsa24Callback accepts the provider callback, then independently asks P24
// for STATUS-PAY. This makes spoofed callback bodies harmless.
func (h *UserTransactionHandler) Pulsa24Callback(w http.ResponseWriter, r *http.Request) {
	if h.pulsa24 == nil || !h.pulsa24.Enabled() {
		response.Error(w, http.StatusServiceUnavailable, "integrasi Pulsa24Jam belum aktif")
		return
	}
	var payload map[string]any
	if json.NewDecoder(r.Body).Decode(&payload) != nil {
		response.Error(w, http.StatusBadRequest, "callback tidak valid")
		return
	}
	refID := strings.TrimSpace(fmt.Sprint(payload["refid"]))
	if nested, ok := payload["data"].(map[string]any); ok && refID == "" {
		refID = strings.TrimSpace(fmt.Sprint(nested["refid"]))
	}
	order, found := h.pulsa24.Order(refID)
	if refID == "" || !found {
		response.JSON(w, http.StatusAccepted, map[string]any{"ok": true})
		return
	}
	result, err := h.pulsa24.Verify(order)
	if err != nil {
		response.Error(w, http.StatusBadGateway, "status callback belum dapat diverifikasi")
		return
	}
	if result.Status == "success" || result.Status == "failed" {
		h.finalizePulsa24(refID, result)
	}
	response.JSON(w, http.StatusOK, map[string]any{"ok": true, "refid": refID, "status": result.Status})
}

func (h *UserTransactionHandler) TopUp(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r)
	if !ok {
		return
	}
	response.Error(w, http.StatusServiceUnavailable, "isi saldo belum aktif. Hubungkan QRIS atau Virtual Account resmi beserta webhook pembayaran sebelum menerima isi saldo")
	return
	var in topupInput
	if json.NewDecoder(r.Body).Decode(&in) != nil || in.Amount < 10000 {
		response.Error(w, 400, "nominal isi saldo minimal Rp10.000")
		return
	}
	user, err := h.auth.ChangeBalance(r.Header.Get("Authorization"), in.Amount)
	if err != nil {
		response.Error(w, 422, err.Error())
		return
	}
	tx := domain.Transaction{ID: fmt.Sprintf("TOPUP-%d", time.Now().UnixMilli()), Customer: "Isi Saldo KuotaKita", Method: "Top Up · " + in.Method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	h.append(id, tx)
	response.JSON(w, http.StatusCreated, map[string]any{"transaction": tx, "balance": user.Balance})
}

func (h *UserTransactionHandler) append(id string, tx domain.Transaction) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.items[id] = append([]domain.Transaction{tx}, h.items[id]...)
	_ = h.saveLocked()
}
func (h *UserTransactionHandler) load() error {
	if h.state != nil {
		var file transactionFile
		found, err := h.state.Load("wallet-transactions", &file)
		if err != nil {
			return err
		}
		if found {
			if file.Items != nil {
				h.items = file.Items
			}
			return nil
		}
	}
	if h.dataFile == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(h.dataFile), 0700); err != nil {
		return err
	}
	data, err := os.ReadFile(h.dataFile)
	if os.IsNotExist(err) {
		if h.state != nil {
			return h.state.Save("wallet-transactions", transactionFile{Items: h.items})
		}
		return nil
	}
	if err != nil {
		return err
	}
	var file transactionFile
	if err := json.Unmarshal(data, &file); err != nil {
		return err
	}
	if file.Items != nil {
		h.items = file.Items
	}
	if h.state != nil {
		return h.state.Save("wallet-transactions", transactionFile{Items: h.items})
	}
	return nil
}
func (h *UserTransactionHandler) saveLocked() error {
	if h.state != nil {
		return h.state.Save("wallet-transactions", transactionFile{Items: h.items})
	}
	if h.dataFile == "" {
		return nil
	}
	data, err := json.Marshal(transactionFile{Items: h.items})
	if err != nil {
		return err
	}
	tmp := h.dataFile + ".tmp"
	if err := os.WriteFile(tmp, data, 0600); err != nil {
		return err
	}
	return os.Rename(tmp, h.dataFile)
}
