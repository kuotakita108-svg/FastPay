package handler

import (
	"fastpay/backend/internal/http/response"
	"net/http"
	"time"
)

func Health(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, map[string]any{"status": "ok", "service": "FastPay API", "time": time.Now()})
}
