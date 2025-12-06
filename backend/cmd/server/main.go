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
	gin.SetMode(gin.ReleaseMode)
	log.Printf("Server starting on 127.0.0.1:%s", port)
	if err := srv.R.Run("127.0.0.1:" + port); err != nil {
		log.Fatalf("Failed to start server: %v\n\nNote: If you see 'bind: address already in use', another process is using port %s.\nOn Windows: netstat -ano | findstr :%s\nOn Mac/Linux: lsof -i :%s\nThen kill the process using: taskkill /PID <PID> /F (Windows) or kill <PID> (Mac/Linux)", err, port, port, port)
	}
}
