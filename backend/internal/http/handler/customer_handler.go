package handler

import (
	"pulsaprime/backend/internal/http/response"
	"pulsaprime/backend/internal/service"
	"net/http"
)

type CustomerHandler struct{ service *service.CustomerService }

func NewCustomerHandler(s *service.CustomerService) *CustomerHandler {
	return &CustomerHandler{service: s}
}
func (h *CustomerHandler) List(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, h.service.List())
}
