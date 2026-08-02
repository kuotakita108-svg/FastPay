package handler

import (
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
)

type ProductHandler struct{ service *service.ProductService }

func NewProductHandler(s *service.ProductService) *ProductHandler { return &ProductHandler{service: s} }
func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, h.service.ListByService(r.URL.Query().Get("service")))
}
