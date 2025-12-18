package services

import (
	"12306-backend/db"
	"12306-backend/models"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// InitTrainSchedule generates train services for the next 14 days and cleans up old ones.
func InitTrainSchedule() {
	dbConn := db.GetDB()
	if dbConn == nil {
		log.Println("Database connection not ready, skipping schedule initialization")
		return
	}

	// 1. Cleanup old services (older than 1 day ago)
	cleanupOldServices(dbConn)

	// 1.5. Cleanup expired orders (timeout but not canceled)
	cleanupExpiredOrders(dbConn)

	// 2. Ensure stations and reference data exist (Prerequisite)
	ensureReferenceData(dbConn)

	// 3. Generate future services
	generateFutureServices(dbConn)
}

func cleanupOldServices(tx *gorm.DB) {
	// Keep services from yesterday onwards. Delete older.
	// "Yesterday" means today - 1 day.
	threshold := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	
	// Delete
	result := tx.Where("service_date < ?", threshold).Delete(&models.TrainService{})
	if result.RowsAffected > 0 {
		log.Printf("Cleaned up %d old train services older than %s", result.RowsAffected, threshold)
	}
}

func cleanupExpiredOrders(tx *gorm.DB) {
	// Find orders that are pending_payment and expired
	// Update status to canceled
	// Note: Database triggers (trg_order_cancel_release) should handle inventory release
	
	now := time.Now()
	result := tx.Model(&models.Order{}).
		Where("status = ? AND expires_at < ?", "pending_payment", now).
		Update("status", "canceled")
		
	if result.Error != nil {
		log.Printf("Failed to cleanup expired orders: %v", result.Error)
	} else if result.RowsAffected > 0 {
		log.Printf("Cleaned up %d expired orders", result.RowsAffected)
	}
}

func ensureReferenceData(tx *gorm.DB) {
	// Ensure Stations
	stations := []models.Station{
		{Code: "BJP", NameEn: "Beijing", NameZh: "北京"},
		{Code: "SHH", NameEn: "Shanghai", NameZh: "上海"},
		{Code: "VNP", NameEn: "Beijing South", NameZh: "北京南"},
		{Code: "AOH", NameEn: "Shanghai Hongqiao", NameZh: "上海虹桥"},
		{Code: "TJN", NameEn: "Tianjin", NameZh: "天津"},
		{Code: "NJH", NameEn: "Nanjing", NameZh: "南京"},
	}

	for _, s := range stations {
		var count int64
		tx.Model(&models.Station{}).Where("code = ?", s.Code).Count(&count)
		if count == 0 {
			// Create
			s.ID = uuid.New()
			tx.Create(&s)
		}
	}

	// Ensure Trains (Reference Table)
	trains := []models.Train{
		{TrainNo: "G1", TrainType: "G"},
		{TrainNo: "G2", TrainType: "G"},
		{TrainNo: "G101", TrainType: "G"},
		{TrainNo: "G102", TrainType: "G"},
		{TrainNo: "Z1", TrainType: "Z"},
	}
	for _, t := range trains {
		var count int64
		tx.Model(&models.Train{}).Where("train_no = ?", t.TrainNo).Count(&count)
		if count == 0 {
			tx.Create(&t)
		}
	}
}

func generateFutureServices(tx *gorm.DB) {
	// Define templates
	templates := []struct {
		TrainNo   string
		FromCode  string
		ToCode    string
		Depart    string
		Arrive    string
		Duration  string // Just for record, simple calc
		Price     int    // Base price for second class
	}{
		{"G1", "VNP", "AOH", "09:00", "13:30", "4h30m", 55300},
		{"G2", "AOH", "VNP", "14:00", "18:30", "4h30m", 55300},
		{"G101", "VNP", "AOH", "07:00", "12:30", "5h30m", 55300},
		{"G102", "AOH", "VNP", "13:00", "18:30", "5h30m", 55300},
		{"Z1", "BJP", "SHH", "19:00", "08:00", "13h00m", 18000}, // Overnight
	}

	today := time.Now()
	
	for i := 0; i < 14; i++ {
		targetDate := today.AddDate(0, 0, i)
		dateStr := targetDate.Format("2006-01-02")
		
		for _, t := range templates {
			// Check if exists
			var exists int64
			tx.Model(&models.TrainService{}).Where("train_no = ? AND service_date = ?", t.TrainNo, dateStr).Count(&exists)
			if exists > 0 {
				continue
			}

			// Create TrainService
			service := models.TrainService{
				TrainNo:     t.TrainNo,
				ServiceDate: targetDate,
			}
			if err := tx.Create(&service).Error; err != nil {
				log.Printf("Failed to create service %s on %s: %v", t.TrainNo, dateStr, err)
				continue
			}

			// Resolve Station IDs
			var fromStation, toStation models.Station
			tx.Where("code = ?", t.FromCode).First(&fromStation)
			tx.Where("code = ?", t.ToCode).First(&toStation)

			// Create Segment
			segment := models.ServiceSegment{
				TrainServiceID: service.ID,
				FromStationID:  fromStation.ID,
				ToStationID:    toStation.ID,
				DepartTime:     t.Depart,
				ArriveTime:     t.Arrive,
				Duration:       t.Duration,
				FromStopSeq:    1, // Default start
				ToStopSeq:      2, // Default end
			}
			tx.Create(&segment)

			// Create Inventory
			// Second Class
			tx.Create(&models.SegmentSeatInventory{
				TrainServiceID: service.ID,
				SegmentID:      segment.ID,
				SeatType:       "second",
				TotalSeats:     100,
				LeftSeats:      100, // Full initially
				PriceCents:     t.Price,
			})
			// First Class
			tx.Create(&models.SegmentSeatInventory{
				TrainServiceID: service.ID,
				SegmentID:      segment.ID,
				SeatType:       "first",
				TotalSeats:     50,
				LeftSeats:      50,
				PriceCents:     int(float64(t.Price) * 1.6),
			})
			// Business Class
			tx.Create(&models.SegmentSeatInventory{
				TrainServiceID: service.ID,
				SegmentID:      segment.ID,
				SeatType:       "business",
				TotalSeats:     20,
				LeftSeats:      20,
				PriceCents:     t.Price * 3,
			})
		}
	}
	fmt.Println("Train schedule initialized for next 14 days.")
}
