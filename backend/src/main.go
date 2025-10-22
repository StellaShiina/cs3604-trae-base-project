package main

import (
	"log"
	"railway-booking/src/config"
	"railway-booking/src/routes"
)

func main() {
	// Connect to database
	dbConfig := config.GetDatabaseConfig()
	db, err := config.ConnectDatabase(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 跳过数据库迁移，因为我们使用模拟数据
	log.Println("Skipping database migration for mock database")

	// Setup routes
	jwtSecret := "your-secret-key" // 在生产环境中应该从环境变量获取
	r := routes.SetupRoutes(db, jwtSecret)

	// Start server
	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}