package main

import (
	"12306-backend/db"
	"12306-backend/models"
	"12306-backend/routes"
	"12306-backend/services"
	"log"
)

func main() {
	db.Init()

	// Pre-migration fixes for Enum types and Defaults
	// GORM AutoMigrate might fail if columns have defaults that can't be cast automatically when changing types.
	// We drop defaults for enum columns to allow type alteration.
	db.GetDB().Exec("ALTER TABLE passengers ALTER COLUMN card_type DROP DEFAULT")
	db.GetDB().Exec("ALTER TABLE passengers ALTER COLUMN passenger_type DROP DEFAULT")
	db.GetDB().Exec("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT")
	db.GetDB().Exec("ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT")
	db.GetDB().Exec("ALTER TABLE tickets ALTER COLUMN ticket_type DROP DEFAULT")
	db.GetDB().Exec("ALTER TABLE tickets ALTER COLUMN seat_type DROP DEFAULT")
	
	// AutoMigrate
	// Using GORM AutoMigrate for basic schema updates
	err := db.GetDB().AutoMigrate(
        &models.User{}, 
        &models.Passenger{}, 
        &models.Station{}, 
        &models.Train{}, 
        &models.TrainService{}, 
        &models.ServiceSegment{}, 
        &models.SegmentSeatInventory{},
        &models.Order{},
        &models.Ticket{},
    )
    if err != nil {
        log.Fatalf("Database migration failed: %v", err)
    }

    // Initialize train schedule (New Requirement: Auto-seed next 14 days and cleanup old)
    services.InitTrainSchedule()

    r := routes.SetupRouter()
    r.Run(":8081")
}
