package handler

import (
	"pulsaprime/backend/internal/http/response"
	"pulsaprime/backend/internal/service"
	"net/http"
)

type DashboardHandler struct{ service *service.DashboardService }

func NewDashboardHandler(s *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: s}
}
func (h *DashboardHandler) Get(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, h.service.Get())
}
