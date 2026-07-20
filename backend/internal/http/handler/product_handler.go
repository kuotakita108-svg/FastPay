package handler

import (
	"fastpay/backend/internal/http/response"
	"fastpay/backend/internal/service"
	"net/http"
)

type ProductHandler struct{ service *service.ProductService }

func NewProductHandler(s *service.ProductService) *ProductHandler { return &ProductHandler{service: s} }
func (h *ProductHandler) List(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, h.service.List())
}
