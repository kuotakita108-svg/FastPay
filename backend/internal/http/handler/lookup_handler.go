package handler

import (
	"encoding/json"
	"kuotakita/backend/internal/domain"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
	"strings"
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

type recipientLookupInput struct {
	Channel  string `json:"channel"`
	Provider string `json:"provider"`
	Number   string `json:"number"`
}

// RecipientLookup deliberately does not invent a recipient name. Name
// verification is only possible once a licensed payout partner is connected.
func (h *LookupHandler) RecipientLookup(w http.ResponseWriter, r *http.Request) {
	var in recipientLookupInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "data penerima tidak valid")
		return
	}
	if strings.TrimSpace(in.Channel) == "" || strings.TrimSpace(in.Provider) == "" || strings.TrimSpace(in.Number) == "" {
		response.Error(w, http.StatusBadRequest, "jenis layanan, penyedia, dan nomor tujuan wajib diisi")
		return
	}
	response.Error(w, http.StatusServiceUnavailable, "verifikasi nama penerima belum aktif. Hubungkan mitra payout resmi untuk cek rekening/e-wallet dan webhook terlebih dahulu")
}
