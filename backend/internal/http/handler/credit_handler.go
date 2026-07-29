package handler

import (
	"encoding/json"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
)

type CreditHandler struct{ service *service.CreditService }

func NewCreditHandler(service *service.CreditService) *CreditHandler {
	return &CreditHandler{service: service}
}

func (h *CreditHandler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.List(r.Header.Get("Authorization"))
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *CreditHandler) Save(w http.ResponseWriter, r *http.Request) {
	var input map[string]any
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 12<<20)).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "data pengajuan tidak valid atau terlalu besar")
		return
	}
	item, err := h.service.Save(r.Header.Get("Authorization"), input)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, item)
}
