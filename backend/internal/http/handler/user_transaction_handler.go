package handler

import (
	"encoding/json"
	"fmt"
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
}

type transactionFile struct { Items map[string][]domain.Transaction `json:"items"` }
type paymentInput struct { Title string `json:"title"`; Target string `json:"target"`; Provider string `json:"provider"`; Product string `json:"product"`; Email string `json:"email"`; Amount int64 `json:"amount"` }
type topupInput struct { Amount int64 `json:"amount"`; Method string `json:"method"` }

func NewUserTransactionHandler(auth *service.AuthService, dataFile string) *UserTransactionHandler {
	h := &UserTransactionHandler{items: make(map[string][]domain.Transaction), auth: auth, dataFile: dataFile}
	_ = h.load()
	return h
}

func (h *UserTransactionHandler) userID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id, err := h.auth.UserID(r.Header.Get("Authorization"))
	if err != nil { response.Error(w, http.StatusUnauthorized, err.Error()); return "", false }
	return id, true
}

func (h *UserTransactionHandler) List(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r); if !ok { return }
	h.mu.RLock(); items := append([]domain.Transaction{}, h.items[id]...); h.mu.RUnlock()
	response.JSON(w, http.StatusOK, items)
}

func (h *UserTransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r); if !ok { return }
	var in domain.CreateTransactionInput
	if json.NewDecoder(r.Body).Decode(&in) != nil { response.Error(w, 400, "data transaksi tidak valid"); return }
	if in.Amount < 1000 || in.Customer == "" { response.Error(w, 422, "tujuan dan nominal wajib diisi"); return }
	tx := domain.Transaction{ID: fmt.Sprintf("PP-%d", time.Now().UnixMilli()), Customer: in.Customer, Email: in.Email, Method: in.Method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	h.append(id, tx)
	response.JSON(w, http.StatusCreated, tx)
}

func (h *UserTransactionHandler) Payment(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r); if !ok { return }
	var in paymentInput
	if json.NewDecoder(r.Body).Decode(&in) != nil || in.Amount < 1 { response.Error(w, 400, "data pembayaran tidak valid"); return }
	user, err := h.auth.ChangeBalance(r.Header.Get("Authorization"), -in.Amount)
	if err != nil { response.Error(w, 422, err.Error()); return }
	method := strings.TrimSpace(strings.TrimSpace(in.Provider) + " · " + strings.TrimSpace(in.Title))
	tx := domain.Transaction{ID: fmt.Sprintf("PP-%d", time.Now().UnixMilli()), Customer: in.Target, Email: in.Email, Method: method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	h.append(id, tx)
	response.JSON(w, http.StatusCreated, map[string]any{"transaction": tx, "balance": user.Balance})
}

func (h *UserTransactionHandler) TopUp(w http.ResponseWriter, r *http.Request) {
	id, ok := h.userID(w, r); if !ok { return }
	var in topupInput
	if json.NewDecoder(r.Body).Decode(&in) != nil || in.Amount < 10000 { response.Error(w, 400, "nominal isi saldo minimal Rp10.000"); return }
	user, err := h.auth.ChangeBalance(r.Header.Get("Authorization"), in.Amount)
	if err != nil { response.Error(w, 422, err.Error()); return }
	tx := domain.Transaction{ID: fmt.Sprintf("TOPUP-%d", time.Now().UnixMilli()), Customer: "Isi Saldo KuotaKita", Method: "Top Up · " + in.Method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	h.append(id, tx)
	response.JSON(w, http.StatusCreated, map[string]any{"transaction": tx, "balance": user.Balance})
}

func (h *UserTransactionHandler) append(id string, tx domain.Transaction) {
	h.mu.Lock(); defer h.mu.Unlock()
	h.items[id] = append([]domain.Transaction{tx}, h.items[id]...)
	_ = h.saveLocked()
}
func (h *UserTransactionHandler) load() error {
	if h.dataFile == "" { return nil }
	if err := os.MkdirAll(filepath.Dir(h.dataFile), 0700); err != nil { return err }
	data, err := os.ReadFile(h.dataFile)
	if os.IsNotExist(err) { return nil }; if err != nil { return err }
	var file transactionFile
	if err := json.Unmarshal(data, &file); err != nil { return err }
	if file.Items != nil { h.items = file.Items }
	return nil
}
func (h *UserTransactionHandler) saveLocked() error {
	if h.dataFile == "" { return nil }
	data, err := json.Marshal(transactionFile{Items: h.items}); if err != nil { return err }
	tmp := h.dataFile + ".tmp"
	if err := os.WriteFile(tmp, data, 0600); err != nil { return err }
	return os.Rename(tmp, h.dataFile)
}
