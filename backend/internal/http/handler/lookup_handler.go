package handler

import (
	"encoding/json"
	"pulsaprime/backend/internal/domain"
	"pulsaprime/backend/internal/http/response"
	"pulsaprime/backend/internal/service"
	"net/http"
)

type LookupHandler struct{ service *service.LookupService }

func NewLookupHandler(s *service.LookupService) *LookupHandler { return &LookupHandler{service: s} }
func (h *LookupHandler) Lookup(w http.ResponseWriter, r *http.Request) {
	var in domain.LookupInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, 400, "data pemeriksaan tidak valid")
		return
	}
	result, err := h.service.Lookup(in)
	if err != nil {
		response.Error(w, 422, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, result)
}
