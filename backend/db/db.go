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
	})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

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
