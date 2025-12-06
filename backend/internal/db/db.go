package db

import (
    "fmt"
    "log"
    "strings"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func Open(dsn string) (*gorm.DB, error) {
    gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        // Enhance error message with troubleshooting guidance
        if strings.Contains(err.Error(), "connection refused") || strings.Contains(err.Error(), "dial tcp") {
            return nil, fmt.Errorf(`database connection failed: %w

Troubleshooting steps:
1. Ensure PostgreSQL is running. If using Docker:
   - Start Docker Desktop (Windows/Mac) or Docker daemon (Linux)
   - Run: docker compose up -d
   - Verify with: docker ps
2. Check database configuration in environment variables:
   - DB_HOST (default: 127.0.0.1)
   - DB_PORT (default: 5432)
   - DB_USER (default: postgres)
   - DB_PASSWORD (default: postgres)
   - DB_NAME (default: railway12306)
3. If database is on a different host/port, set the environment variables accordingly
4. Check if port 5432 is accessible: netstat -ano | findstr :5432 (Windows) or lsof -i :5432 (Mac/Linux)`, err)
        }
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }
    sqlDB, err := gdb.DB()
    if err == nil {
        sqlDB.SetMaxOpenConns(10)
        sqlDB.SetMaxIdleConns(5)
    }
    log.Printf("connected database")
    return gdb, nil
}