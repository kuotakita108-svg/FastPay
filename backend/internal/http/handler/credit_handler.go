package handler

import (
	"encoding/json"
	"errors"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
)

type CreditHandler struct{ service *service.CreditService }

func NewCreditHandler(service *service.CreditService) *CreditHandler {
	return &CreditHandler{service: service}
}

func (h *CreditHandler) List(w http.ResponseWriter, r *http.Request) {
	var items []map[string]any
	var err error
	if r.URL.Query().Get("summary") == "1" {
		items, err = h.service.ListSummary(r.Header.Get("Authorization"))
	} else {
		items, err = h.service.List(r.Header.Get("Authorization"))
	}
	if err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, service.ErrForbidden) {
			status = http.StatusForbidden
		}
		response.Error(w, status, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *CreditHandler) Get(w http.ResponseWriter, r *http.Request) {
	item, err := h.service.Get(r.Header.Get("Authorization"), r.PathValue("id"))
	if err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, service.ErrForbidden) {
			status = http.StatusForbidden
		} else if errors.Is(err, service.ErrCreditNotFound) {
			status = http.StatusNotFound
		}
		response.Error(w, status, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *CreditHandler) GetDocument(w http.ResponseWriter, r *http.Request) {
	item, err := h.service.GetDocument(r.Header.Get("Authorization"), r.PathValue("id"), r.PathValue("documentKey"))
	if err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, service.ErrForbidden) {
			status = http.StatusForbidden
		} else if errors.Is(err, service.ErrCreditNotFound) {
			status = http.StatusNotFound
		}
		response.Error(w, status, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *CreditHandler) Save(w http.ResponseWriter, r *http.Request) {
	var input map[string]any
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 16<<20)).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "data pengajuan tidak valid atau terlalu besar")
		return
	}
	item, err := h.service.Save(r.Header.Get("Authorization"), input)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrCreditPersistence) {
			status = http.StatusInternalServerError
		} else if errors.Is(err, service.ErrForbidden) {
			status = http.StatusForbidden
		}
		response.Error(w, status, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *CreditHandler) ReviewDocument(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4<<10)).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "status pemeriksaan dokumen tidak valid")
		return
	}
	item, err := h.service.ReviewDocument(
		r.Header.Get("Authorization"),
		r.PathValue("id"),
		r.PathValue("documentKey"),
		input.Status,
		input.Note,
	)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrCreditPersistence) {
			status = http.StatusInternalServerError
		} else if errors.Is(err, service.ErrForbidden) {
			status = http.StatusForbidden
		}
		response.Error(w, status, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *CreditHandler) RecordPayment(w http.ResponseWriter, r *http.Request) {
	var input map[string]any
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 16<<20)).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "data pembayaran tidak valid atau terlalu besar")
		return
	}
	item, err := h.service.RecordPayment(r.Header.Get("Authorization"), r.PathValue("id"), input)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrForbidden) {
			status = http.StatusForbidden
		}
		response.Error(w, status, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, item)
}
