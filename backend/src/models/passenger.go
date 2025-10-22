package models

import (
	"time"
	"gorm.io/gorm"
)

// Passenger 乘车人模型
type Passenger struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	UserID           uint      `json:"userId" gorm:"not null"`
	Name             string    `json:"name" gorm:"not null"`
	IDType           string    `json:"idType" gorm:"not null"`
	IDNumber         string    `json:"idNumber" gorm:"not null"`
	Phone            string    `json:"phone"`
	PassengerType    string    `json:"passengerType" gorm:"not null"` // adult, child, student
	VerificationStatus string  `json:"verificationStatus" gorm:"default:'unverified'"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
	
	// 关联关系
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// PassengerResponse 乘车人响应结构体
type PassengerResponse struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	IDType           string `json:"idType"`
	IDNumber         string `json:"idNumber"`
	Phone            string `json:"phone"`
	VerificationStatus string `json:"verificationStatus"`
}

// ToResponse 转换为响应格式
func (p *Passenger) ToResponse() PassengerResponse {
	return PassengerResponse{
		ID:               p.ID,
		Name:             p.Name,
		IDType:           p.IDType,
		IDNumber:         p.IDNumber,
		Phone:            p.Phone,
		VerificationStatus: p.VerificationStatus,
	}
}