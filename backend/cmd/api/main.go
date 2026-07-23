package main

import (
	"log"

	"kuotakita/backend/internal/app"
	"kuotakita/backend/internal/config"
)

func main() {
	cfg := config.Load()
	server := app.New(cfg)
	log.Printf("%s API running at http://localhost:%s", cfg.AppName, cfg.Port)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}
