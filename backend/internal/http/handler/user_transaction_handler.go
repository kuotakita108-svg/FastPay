package handler

import (
	"encoding/json"
	"pulsaprime/backend/internal/domain"
	"pulsaprime/backend/internal/http/response"
	"pulsaprime/backend/internal/service"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type UserTransactionHandler struct {
	mu    sync.RWMutex
	items map[string][]domain.Transaction
	auth  *service.AuthService
}

func NewUserTransactionHandler(auth *service.AuthService) *UserTransactionHandler {
	return &UserTransactionHandler{items: make(map[string][]domain.Transaction), auth: auth}
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
	id, ok := h.userID(w, r)
	if !ok {
		return
	}
	var in domain.CreateTransactionInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, 400, "data transaksi tidak valid")
		return
	}
	if in.Amount < 1000 || in.Customer == "" {
		response.Error(w, 422, "tujuan dan nominal wajib diisi")
		return
	}
	tx := domain.Transaction{ID: fmt.Sprintf("PP-%d", time.Now().UnixMilli()), Customer: in.Customer, Email: in.Email, Method: in.Method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	h.mu.Lock()
	h.items[id] = append([]domain.Transaction{tx}, h.items[id]...)
	h.mu.Unlock()
	response.JSON(w, http.StatusCreated, tx)
}
