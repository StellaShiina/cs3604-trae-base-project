package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    Username  string         `gorm:"type:citext;unique;not null"`
    Email     *string        `gorm:"type:citext;unique"`
    Mobile    *string        `gorm:"type:citext;unique"`
    PasswordHash string      `gorm:"not null"`
    Name      *string
    Nationality *string
    PassportNumber *string
    PassportExpirationDate *time.Time
    DateOfBirth *time.Time
    Gender    *string
    Status    string         `gorm:"default:active"`
    LastLoginAt *time.Time
    CreatedAt time.Time      `gorm:"default:now()"`
    UpdatedAt time.Time      `gorm:"default:now()"`
    DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Station struct {
    ID     string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    Code   string `gorm:"unique;not null"`
    NameEn string `gorm:"not null"`
    NameZh *string
    CityEn *string
    CityZh *string
    Pinyin *string
}