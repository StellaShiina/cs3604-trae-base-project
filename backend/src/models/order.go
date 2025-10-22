package models

import (
	"time"
	"gorm.io/gorm"
)

// Order 订单模型
type Order struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"userId" gorm:"not null"`
	PassengerID   uint      `json:"passengerId" gorm:"not null"`
	OrderNumber   string    `json:"orderNumber" gorm:"uniqueIndex;not null"`
	TrainNumber   string    `json:"trainNumber" gorm:"not null"`
	Departure     string    `json:"departure" gorm:"not null"`
	Arrival       string    `json:"arrival" gorm:"not null"`
	FromStation   string    `json:"fromStation" gorm:"not null"`
	ToStation     string    `json:"toStation" gorm:"not null"`
	DepartureDate time.Time `json:"departureDate"`
	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
	PassengerName string    `json:"passengerName" gorm:"not null"`
	SeatType      string    `json:"seatType" gorm:"not null"`
	SeatInfo      string    `json:"seatInfo" gorm:"not null"`
	Price         float64   `json:"price" gorm:"not null"`
	PaymentTime   *time.Time `json:"paymentTime"`
	Status        string    `json:"status" gorm:"default:'pending'"` // pending, paid, cancelled, completed
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
	
	// 关联关系
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Passenger Passenger `json:"passenger" gorm:"foreignKey:PassengerID"`
}

// OrderResponse 订单响应结构体
type OrderResponse struct {
	OrderID       uint      `json:"orderId"`
	OrderDate     time.Time `json:"orderDate"`
	TrainNumber   string    `json:"trainNumber"`
	Departure     string    `json:"departure"`
	Arrival       string    `json:"arrival"`
	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
	PassengerName string    `json:"passengerName"`
	SeatInfo      string    `json:"seatInfo"`
	Price         float64   `json:"price"`
	Status        string    `json:"status"`
}

// ToResponse 转换为响应格式
func (o *Order) ToResponse() OrderResponse {
	return OrderResponse{
		OrderID:       o.ID,
		OrderDate:     o.CreatedAt,
		TrainNumber:   o.TrainNumber,
		Departure:     o.Departure,
		Arrival:       o.Arrival,
		DepartureTime: o.DepartureTime,
		ArrivalTime:   o.ArrivalTime,
		PassengerName: o.PassengerName,
		SeatInfo:      o.SeatInfo,
		Price:         o.Price,
		Status:        o.Status,
	}
}