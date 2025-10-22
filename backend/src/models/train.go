package models

import (
	"time"
	"gorm.io/gorm"
)

// Train 列车模型
type Train struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	TrainNumber   string    `json:"trainNumber" gorm:"uniqueIndex;not null"`
	TrainType     string    `json:"trainType" gorm:"not null"` // G, D, C, K, T等
	FromStation   string    `json:"fromStation" gorm:"not null"`
	ToStation     string    `json:"toStation" gorm:"not null"`
	DepartureTime string    `json:"departureTime" gorm:"not null"`
	ArrivalTime   string    `json:"arrivalTime" gorm:"not null"`
	Duration      string    `json:"duration" gorm:"not null"`
	Distance      int       `json:"distance" gorm:"not null"`
	
	// 座位类型和价格
	BusinessSeatPrice float64 `json:"businessSeatPrice"`
	FirstClassPrice   float64 `json:"firstClassPrice"`
	SecondClassPrice  float64 `json:"secondClassPrice"`
	HardSleeperPrice  float64 `json:"hardSleeperPrice"`
	SoftSleeperPrice  float64 `json:"softSleeperPrice"`
	HardSeatPrice     float64 `json:"hardSeatPrice"`
	
	// 余票数量
	BusinessSeatCount int `json:"businessSeatCount"`
	FirstClassCount   int `json:"firstClassCount"`
	SecondClassCount  int `json:"secondClassCount"`
	HardSleeperCount  int `json:"hardSleeperCount"`
	SoftSleeperCount  int `json:"softSleeperCount"`
	HardSeatCount     int `json:"hardSeatCount"`
	
	// 运行日期
	RunDays   string    `json:"runDays" gorm:"not null"` // 1234567表示周一到周日
	Status    string    `json:"status" gorm:"default:'active'"` // active, suspended
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TrainResponse 列车响应结构体
type TrainResponse struct {
	TrainNumber   string  `json:"trainNumber"`
	TrainType     string  `json:"trainType"`
	FromStation   string  `json:"fromStation"`
	ToStation     string  `json:"toStation"`
	DepartureTime string  `json:"departureTime"`
	ArrivalTime   string  `json:"arrivalTime"`
	Duration      string  `json:"duration"`
	
	// 座位信息
	BusinessSeat SeatInfo `json:"businessSeat"`
	FirstClass   SeatInfo `json:"firstClass"`
	SecondClass  SeatInfo `json:"secondClass"`
	HardSleeper  SeatInfo `json:"hardSleeper"`
	SoftSleeper  SeatInfo `json:"softSleeper"`
	HardSeat     SeatInfo `json:"hardSeat"`
}

// SeatInfo 座位信息
type SeatInfo struct {
	Available bool    `json:"available"`
	Count     int     `json:"count"`
	Price     float64 `json:"price"`
}

// ToResponse 转换为响应格式
func (t *Train) ToResponse() TrainResponse {
	return TrainResponse{
		TrainNumber:   t.TrainNumber,
		TrainType:     t.TrainType,
		FromStation:   t.FromStation,
		ToStation:     t.ToStation,
		DepartureTime: t.DepartureTime,
		ArrivalTime:   t.ArrivalTime,
		Duration:      t.Duration,
		BusinessSeat: SeatInfo{
			Available: t.BusinessSeatCount > 0,
			Count:     t.BusinessSeatCount,
			Price:     t.BusinessSeatPrice,
		},
		FirstClass: SeatInfo{
			Available: t.FirstClassCount > 0,
			Count:     t.FirstClassCount,
			Price:     t.FirstClassPrice,
		},
		SecondClass: SeatInfo{
			Available: t.SecondClassCount > 0,
			Count:     t.SecondClassCount,
			Price:     t.SecondClassPrice,
		},
		HardSleeper: SeatInfo{
			Available: t.HardSleeperCount > 0,
			Count:     t.HardSleeperCount,
			Price:     t.HardSleeperPrice,
		},
		SoftSleeper: SeatInfo{
			Available: t.SoftSleeperCount > 0,
			Count:     t.SoftSleeperCount,
			Price:     t.SoftSleeperPrice,
		},
		HardSeat: SeatInfo{
			Available: t.HardSeatCount > 0,
			Count:     t.HardSeatCount,
			Price:     t.HardSeatPrice,
		},
	}
}