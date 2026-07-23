package handler

import (
	"encoding/json"
	"kuotakita/backend/internal/domain"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
)

type AuthHandler struct{ service *service.AuthService }

func NewAuthHandler(s *service.AuthService) *AuthHandler { return &AuthHandler{service: s} }
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var in domain.LoginInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, 400, "data login tidak valid")
		return
	}
	result, err := h.service.Login(in.Username, in.Password)
	if err != nil {
		response.Error(w, 401, err.Error())
		return
	}
	response.JSON(w, 200, result)
}
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var in domain.RegisterInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, 400, "data pendaftaran tidak valid")
		return
	}
	result, err := h.service.Register(in)
	if err != nil {
		response.Error(w, 422, err.Error())
		return
	}
	response.JSON(w, 201, result)
}
func (h *AuthHandler) Google(w http.ResponseWriter, _ *http.Request) {
	response.Error(w, http.StatusNotImplemented, "Google OAuth belum dikonfigurasi. Isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET pada .env")
}
