package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
    ID           uuid.UUID `gorm:"primary_key" json:"id"`
    Username     string    `gorm:"unique;not null" json:"username"`
    Email        *string   `gorm:"unique" json:"email"`
    Mobile       *string   `gorm:"unique" json:"mobile"`
    PasswordHash string    `gorm:"not null" json:"-"`
    Name         string    `json:"name"`
    IDType       string    `json:"id_type"`
    IDNo         string    `json:"id_no"`
    Status       string    `gorm:"default:'active'" json:"status"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

type Passenger struct {
	ID            uuid.UUID `gorm:"primary_key" json:"id"`
	UserID        uuid.UUID `gorm:"not null" json:"user_id"`
	Name          string    `gorm:"not null" json:"name"`
	CardType      string    `gorm:"not null;default:'id_card'" json:"card_type"`
	CardNo        string    `gorm:"not null" json:"card_no"`
	PassengerType string    `gorm:"not null;default:'adult'" json:"passenger_type"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (p *Passenger) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return
}

type Train struct {
	TrainNo   string `gorm:"primary_key"`
	TrainType string `gorm:"not null"`
}

type Station struct {
	ID     uuid.UUID `gorm:"primary_key" json:"id"`
	Code   string    `gorm:"unique;not null" json:"code"`
	NameEn string    `gorm:"not null" json:"name_en"`
	NameZh string    `json:"name_zh"`
}

type Order struct {
	ID              uuid.UUID `gorm:"primary_key"`
	UserID          uuid.UUID `gorm:"not null"`
	TrainServiceID  int64     `gorm:"not null"`
	FromStationID   uuid.UUID `gorm:"not null"`
	ToStationID     uuid.UUID `gorm:"not null"`
	SegmentID       int64     `gorm:"not null"`
	Status          string    `gorm:"not null;default:'pending_payment'"`
	TotalPriceCents int       `gorm:"not null"`
	CreatedAt       time.Time
	ExpiresAt       time.Time
	PaidAt          *time.Time
	UpdatedAt       time.Time

	// Associations
	TrainService TrainService   `gorm:"foreignKey:TrainServiceID"`
	FromStation  Station        `gorm:"foreignKey:FromStationID"`
	ToStation    Station        `gorm:"foreignKey:ToStationID"`
	Segment      ServiceSegment `gorm:"foreignKey:SegmentID"`
	Tickets      []Ticket       `gorm:"foreignKey:OrderID"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) (err error) {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return
}

type Ticket struct {
	ID                int64     `gorm:"primary_key"`
	OrderID           uuid.UUID `gorm:"not null"`
	PassengerID       *uuid.UUID
	PassengerName     string
	PassengerCardType string
	PassengerCardNo   string
	SeatType          string
	TicketType        string
	PriceCents        int
	SeatNo            *string
	Status            string `gorm:"default:'active'"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// New models for missing tables

func (s *Station) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}

type TrainService struct {
	ID          int64     `gorm:"primary_key"`
	TrainNo     string    `gorm:"not null"`
	ServiceDate time.Time `gorm:"type:date;not null"` // In SQLite date might need care, but Gorm handles it
}

type ServiceSegment struct {
	ID             int64     `gorm:"primary_key"`
	TrainServiceID int64     `gorm:"not null"`
	FromStationID  uuid.UUID `gorm:"not null"`
	ToStationID    uuid.UUID `gorm:"not null"`
	DepartTime     string    `gorm:"type:time;not null"`
	ArriveTime     string    `gorm:"type:time;not null"`
	Duration       string    `gorm:"type:interval;not null"`
	FromStopSeq    int       `gorm:"not null;default:1"`
	ToStopSeq      int       `gorm:"not null;default:2"`
}

type SegmentSeatInventory struct {
	ID             int64  `gorm:"primary_key"`
	TrainServiceID int64  `gorm:"not null"`
	SegmentID      int64  `gorm:"not null"`
	SeatType       string `gorm:"not null"`
	TotalSeats     int    `gorm:"not null"`
	LeftSeats      int    `gorm:"not null"`
	PriceCents     int    `gorm:"not null"`
	Currency       string `gorm:"default:'CNY'"`
}

func (SegmentSeatInventory) TableName() string {
	return "segment_seat_inventory"
}
