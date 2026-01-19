package services

import (
	"12306-backend/db"
	"12306-backend/models"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"gorm.io/gorm"
)

// InitTrainSchedule generates train services using SQL scripts from database/db-init
func InitTrainSchedule() {
	dbConn := db.GetDB()
	if dbConn == nil {
		log.Println("Database connection not ready, skipping schedule initialization")
		return
	}

	// 1. Execute DB Initialization Scripts (Schema, Seed Data & Routes)
	// This ensures tables and enums exist before we try to clean them up.
	if err := executeInitScripts(dbConn); err != nil {
		log.Printf("Failed to execute init scripts: %v", err)
	}

	// 2. Cleanup old services (older than 1 day ago)
	cleanupOldServices(dbConn)

	// 3. Cleanup expired orders
	cleanupExpiredOrders(dbConn)
}

func executeInitScripts(tx *gorm.DB) error {
	// Locate db-init directory
	// Assuming running from backend/backend, so it's ../../database/db-init
	// We can try to find it relative to current working directory
	baseDir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %v", err)
	}

	// Adjust path based on where the binary is running. 
	// If running via 'go run main.go' in backend/backend, it is ../../database/db-init
	scriptDir := filepath.Join(baseDir, "..", "..", "database", "db-init")
	
	// Verify directory exists
	if _, err := os.Stat(scriptDir); os.IsNotExist(err) {
		// Try alternative path (maybe running from project root?)
		scriptDir = filepath.Join(baseDir, "database", "db-init")
		if _, err := os.Stat(scriptDir); os.IsNotExist(err) {
			return fmt.Errorf("db-init directory not found at %s or %s", filepath.Join(baseDir, "..", "..", "database", "db-init"), scriptDir)
		}
	}

	log.Printf("Found db-init directory at: %s", scriptDir)

	// List all .sql files
	files, err := os.ReadDir(scriptDir)
	if err != nil {
		return err
	}

	var sqlFiles []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".sql") {
			// We include all .sql files (00-init, 01-seed, 10-routes, etc.)
			// 00-init.sql is idempotent (IF NOT EXISTS, OR REPLACE)
			sqlFiles = append(sqlFiles, f.Name())
		}
	}

	sort.Strings(sqlFiles)

	for _, filename := range sqlFiles {
		log.Printf("Executing SQL script: %s", filename)
		content, err := os.ReadFile(filepath.Join(scriptDir, filename))
		if err != nil {
			return fmt.Errorf("failed to read %s: %v", filename, err)
		}

		if err := tx.Exec(string(content)).Error; err != nil {
			// Log error but maybe continue? Or fail?
			// Some scripts might have dependencies.
			log.Printf("Error executing %s: %v", filename, err)
			// return err // Decide if strict or loose
		}
	}
	
	log.Println("Train schedule initialized from SQL scripts.")
	return nil
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

