package models

import (
	"time"
	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	Username         string    `json:"username" gorm:"uniqueIndex;not null"`
	Password         string    `json:"-" gorm:"not null"`
	RealName         string    `json:"realName" gorm:"not null"`
	IDType           string    `json:"idType" gorm:"not null"`
	IDNumber         string    `json:"idNumber" gorm:"not null"`
	Phone            string    `json:"phone" gorm:"uniqueIndex;not null"`
	Email            string    `json:"email"`
	PassengerType    string    `json:"passengerType" gorm:"not null"`
	VerificationStatus string  `json:"verificationStatus" gorm:"default:'unverified'"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
	
	// 关联关系
	Passengers []Passenger `json:"passengers" gorm:"foreignKey:UserID"`
	Orders     []Order     `json:"orders" gorm:"foreignKey:UserID"`
}

// UserResponse 用户响应结构体（隐藏敏感信息）
type UserResponse struct {
	ID               uint      `json:"userId"`
	Username         string    `json:"username"`
	RealName         string    `json:"realName"`
	IDType           string    `json:"idType"`
	IDNumber         string    `json:"idNumber"`
	Phone            string    `json:"phone"`
	Email            string    `json:"email"`
	PassengerType    string    `json:"passengerType"`
	VerificationStatus string  `json:"verificationStatus"`
}

// ToResponse 转换为响应格式
func (u *User) ToResponse() UserResponse {
	// 部分遮掩身份证号
	maskedIDNumber := u.IDNumber
	if len(maskedIDNumber) > 6 {
		maskedIDNumber = maskedIDNumber[:3] + "****" + maskedIDNumber[len(maskedIDNumber)-4:]
	}
	
	return UserResponse{
		ID:               u.ID,
		Username:         u.Username,
		RealName:         u.RealName,
		IDType:           u.IDType,
		IDNumber:         maskedIDNumber,
		Phone:            u.Phone,
		Email:            u.Email,
		PassengerType:    u.PassengerType,
		VerificationStatus: u.VerificationStatus,
	}
}