package handler

import (
	"encoding/json"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
)

type PreferenceHandler struct { service *service.PreferenceService }
func NewPreferenceHandler(s *service.PreferenceService) *PreferenceHandler { return &PreferenceHandler{service:s} }
func (h *PreferenceHandler) Get(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Get(r.Header.Get("Authorization")); if err != nil { response.Error(w,401,err.Error()); return }; response.JSON(w,200,data)
}
func (h *PreferenceHandler) Save(w http.ResponseWriter, r *http.Request) {
	var data map[string]any; if json.NewDecoder(r.Body).Decode(&data)!=nil { response.Error(w,400,"data preferensi tidak valid");return }
	result, err := h.service.Save(r.Header.Get("Authorization"),data);if err!=nil {response.Error(w,401,err.Error());return};response.JSON(w,200,result)
}
