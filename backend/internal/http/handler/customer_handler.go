package handler

import (
	"fastpay/backend/internal/http/response"
	"fastpay/backend/internal/service"
	"net/http"
)

type CustomerHandler struct{ service *service.CustomerService }

func NewCustomerHandler(s *service.CustomerService) *CustomerHandler {
	return &CustomerHandler{service: s}
}
func (h *CustomerHandler) List(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, h.service.List())
}
