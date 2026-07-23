package handler

import (
	"encoding/json"
	"kuotakita/backend/internal/domain"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
)

type TransactionHandler struct{ service *service.TransactionService }

func NewTransactionHandler(s *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{service: s}
}
func (h *TransactionHandler) List(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, h.service.List())
}
func (h *TransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in domain.CreateTransactionInput
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "format data tidak valid")
		return
	}
	result, err := h.service.Create(in)
	if err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, result)
}
