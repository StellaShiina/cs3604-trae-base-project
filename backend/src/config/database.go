package config

import (
	"log"
	"os"

	"gorm.io/gorm"
)

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func GetDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "railway_user"),
		Password: getEnv("DB_PASSWORD", "railway_password"),
		DBName:   getEnv("DB_NAME", "railway_booking"),
	}
}

func GetTestDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:     getEnv("TEST_DB_HOST", "localhost"),
		Port:     getEnv("TEST_DB_PORT", "5433"),
		User:     getEnv("TEST_DB_USER", "railway_user"),
		Password: getEnv("TEST_DB_PASSWORD", "railway_password"),
		DBName:   getEnv("TEST_DB_NAME", "railway_booking_test"),
	}
}

func ConnectDatabase(config *DatabaseConfig) (*gorm.DB, error) {
	// 为了简化部署，使用模拟数据库连接
	// 在实际生产环境中，这里应该连接到真实的数据库
	log.Printf("Using mock database connection for development")
	
	// 返回nil表示使用模拟数据，避免空GORM实例导致的运行时错误
	return nil, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}