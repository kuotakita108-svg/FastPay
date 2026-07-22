package main

import (
	"log"

	"pulsaprime/backend/internal/app"
	"pulsaprime/backend/internal/config"
)

func main() {
	cfg := config.Load()
	server := app.New(cfg)
	log.Printf("%s API running at http://localhost:%s", cfg.AppName, cfg.Port)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}
