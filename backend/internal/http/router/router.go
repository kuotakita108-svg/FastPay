package router

import (
	"kuotakita/backend/internal/http/handler"
	"net/http"
)

type Handlers struct {
	Transactions     *handler.TransactionHandler
	Customers        *handler.CustomerHandler
	Dashboard        *handler.DashboardHandler
	Products         *handler.ProductHandler
	Auth             *handler.AuthHandler
	Lookup           *handler.LookupHandler
	UserTransactions *handler.UserTransactionHandler
	Credit           *handler.CreditHandler
	Preferences      *handler.PreferenceHandler
}

func New(h Handlers) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", handler.Health)
	mux.HandleFunc("GET /api/v1/dashboard", h.Dashboard.Get)
	mux.HandleFunc("GET /api/v1/transactions", h.Transactions.List)
	mux.HandleFunc("POST /api/v1/transactions", h.Transactions.Create)
	mux.HandleFunc("GET /api/v1/customers", h.Customers.List)
	mux.HandleFunc("GET /api/v1/products", h.Products.List)
	mux.HandleFunc("POST /api/v1/auth/login", h.Auth.Login)
	mux.HandleFunc("POST /api/v1/auth/register", h.Auth.Register)
	mux.HandleFunc("POST /api/v1/auth/agents", h.Auth.CreateAgent)
	mux.HandleFunc("PATCH /api/v1/auth/agents/{id}/access", h.Auth.SetAgentAccess)
	mux.HandleFunc("GET /api/v1/auth/google", h.Auth.Google)
	mux.HandleFunc("GET /api/v1/auth/google/callback", h.Auth.GoogleCallback)
	mux.HandleFunc("POST /api/v1/services/lookup", h.Lookup.Lookup)
	mux.HandleFunc("GET /api/v1/me/transactions", h.UserTransactions.List)
	mux.HandleFunc("POST /api/v1/me/transactions", h.UserTransactions.Create)
	mux.HandleFunc("POST /api/v1/me/payments", h.UserTransactions.Payment)
	mux.HandleFunc("POST /api/v1/me/topups", h.UserTransactions.TopUp)
	mux.HandleFunc("GET /api/v1/me/preferences", h.Preferences.Get)
	mux.HandleFunc("PUT /api/v1/me/preferences", h.Preferences.Save)
	mux.HandleFunc("GET /api/v1/me/agent-credit", h.Credit.List)
	mux.HandleFunc("POST /api/v1/me/agent-credit", h.Credit.Save)
	mux.HandleFunc("GET /api/v1/agent-credit/applications", h.Credit.List)
	mux.HandleFunc("PUT /api/v1/agent-credit/applications/{id}", h.Credit.Save)
	return mux
}
