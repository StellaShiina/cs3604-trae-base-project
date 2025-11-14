package config

import (
    "fmt"
    "os"
)

type DBConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    Name     string
    SSLMode  string
}

func LoadDB() DBConfig {
    cfg := DBConfig{
        Host:     getenv("DB_HOST", "127.0.0.1"),
        Port:     getenv("DB_PORT", "5432"),
        User:     getenv("DB_USER", "postgres"),
        Password: getenv("DB_PASSWORD", "postgres"),
        Name:     getenv("DB_NAME", "railway12306"),
        SSLMode:  getenv("DB_SSLMODE", "disable"),
    }
    return cfg
}

func (c DBConfig) DSN() string {
    return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Shanghai",
        c.Host, c.Port, c.User, c.Password, c.Name, c.SSLMode)
}

func getenv(k, def string) string {
    if v := os.Getenv(k); v != "" {
        return v
    }
    return def
}