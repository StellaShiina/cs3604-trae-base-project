package main

import (
	"log"
	"os"

	"cs3604/backend/internal/config"
	"cs3604/backend/internal/db"
	"cs3604/backend/internal/server"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	cfg := config.LoadDB()
	gdb, err := db.Open(cfg.DSN())
	if err != nil {
		log.Fatalf("db open: %v", err)
	}
	srv := server.New(gdb)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	gin.SetMode(gin.ReleaseMode)
	log.Printf("server listening on :%s", port)
	if err := srv.R.Run("127.0.0.1:" + port); err != nil {
		log.Fatal(err)
	}
}
