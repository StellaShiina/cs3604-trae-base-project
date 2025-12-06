package main

import (
	"log"
	"os"
	"strings"

	"cs3604/backend/internal/config"
	"cs3604/backend/internal/db"
	"cs3604/backend/internal/server"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	cfg := config.LoadDB()
	
	log.Printf("Attempting to connect to database...")
	log.Printf("Database config: host=%s port=%s user=%s dbname=%s", cfg.Host, cfg.Port, cfg.User, cfg.Name)
	
	gdb, err := db.Open(cfg.DSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	log.Printf("Database connected successfully")
	srv := server.New(gdb)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on 127.0.0.1:%s", port)
	if err := srv.R.Run("127.0.0.1:" + port); err != nil {
		if strings.Contains(err.Error(), "address already in use") || strings.Contains(err.Error(), "bind") {
			log.Printf("Failed to start server: %v", err)
			log.Printf("Port %s is already in use by another process.", port)
			log.Printf("To find the process:")
			log.Printf("  Windows: netstat -ano | findstr :%s", port)
			log.Printf("  Mac/Linux: lsof -i :%s", port)
			log.Printf("To kill the process:")
			log.Printf("  Windows: taskkill /PID <PID> /F")
			log.Fatalf("  Mac/Linux: kill <PID>")
		}
		log.Fatalf("Failed to start server: %v", err)
	}
}
