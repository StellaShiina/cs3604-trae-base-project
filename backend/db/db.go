package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=railway12306 port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		// DisableForeignKeyConstraintWhenMigrating: true, // Workaround for constraint issues during dev
	})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// AutoMigrate
	// Note: In a real production app, use migration tools like golang-migrate or atlas.
	// For this project, we use AutoMigrate for convenience.
	// Avoid circular dependency: We cannot import models here if models imports db.
	// Check models imports. models imports gorm.io/gorm and google/uuid. It does NOT import db.
	// So we can import models here? No, models package is `12306-backend/models`.
	// db package is `12306-backend/db`.
	// We need to be careful.
	// If I add `12306-backend/models` to imports, it should be fine.
	
	fmt.Println("Database connected successfully")
}

// InitTest initializes an in-memory SQLite database for testing
func InitTest() {
	var err error
	// Use shared cache to ensure all connections in the pool see the same data
    // Use unique name to ensure isolation between tests
    dbName := fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())
	DB, err = gorm.Open(sqlite.Open(dbName), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		panic("Failed to connect to test database")
	}
	// Set MaxOpenConns to 1 to avoid concurrency locking issues with sqlite shared cache if needed,
	// but shared cache usually handles it. However, standard practice for sqlite memory:
	sqlDB, _ := DB.DB()
	sqlDB.SetMaxOpenConns(1)
}

func GetDB() *gorm.DB {
	return DB
}

func SetDB(db *gorm.DB) {
	DB = db
}
