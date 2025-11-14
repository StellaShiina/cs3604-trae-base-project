package db

import (
    "log"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func Open(dsn string) (*gorm.DB, error) {
    gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, err
    }
    sqlDB, err := gdb.DB()
    if err == nil {
        sqlDB.SetMaxOpenConns(10)
        sqlDB.SetMaxIdleConns(5)
    }
    log.Printf("connected database")
    return gdb, nil
}