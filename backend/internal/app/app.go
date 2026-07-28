package app

import (
	"kuotakita/backend/internal/config"
	"kuotakita/backend/internal/http/handler"
	"kuotakita/backend/internal/http/middleware"
	"kuotakita/backend/internal/http/router"
	"kuotakita/backend/internal/repository/memory"
	"kuotakita/backend/internal/service"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type App struct {
	cfg    config.Config
	server *http.Server
}

func New(cfg config.Config) *App {
	store := memory.New()
	tx := service.NewTransactionService(store)
	customers := service.NewCustomerService(store)
	dashboard := service.NewDashboardService(tx)
	products := service.NewProductService(store)
	auth := service.NewAuthService(cfg.JWTSecret)
	lookup := service.NewLookupService()
	userTransactions := handler.NewUserTransactionHandler(auth)
	routes := router.New(router.Handlers{Transactions: handler.NewTransactionHandler(tx), Customers: handler.NewCustomerHandler(customers), Dashboard: handler.NewDashboardHandler(dashboard), Products: handler.NewProductHandler(products), Auth: handler.NewAuthHandler(auth, cfg), Lookup: handler.NewLookupHandler(lookup), UserTransactions: userTransactions})
	var root http.Handler = routes
	if cfg.StaticDir != "" {
		root = spaHandler(cfg.StaticDir, routes)
	}
	stack := middleware.Logger(middleware.Security(middleware.CORS(cfg.FrontendURL, root)))
	return &App{cfg: cfg, server: &http.Server{Addr: ":" + cfg.Port, Handler: stack, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second}}
}
func (a *App) Run() error { return a.server.ListenAndServe() }

func spaHandler(staticDir string, api http.Handler) http.Handler {
	files := http.FileServer(http.Dir(staticDir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			api.ServeHTTP(w, r)
			return
		}
		path := filepath.Join(staticDir, filepath.Clean(r.URL.Path))
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			files.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})
}
