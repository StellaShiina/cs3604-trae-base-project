package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// API-GET-Stations
func GetStations(c *gin.Context) {
	var stations []models.Station
	
	query := db.GetDB().Model(&models.Station{})
	
	// Support simple search by keyword (code, name_zh, name_en)
	if q := c.Query("q"); q != "" {
		likeQ := "%" + q + "%"
		query = query.Where("code ILIKE ? OR name_zh ILIKE ? OR name_en ILIKE ?", likeQ, likeQ, likeQ)
	}

	if err := query.Find(&stations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stations"})
		return
	}

	// Frontend expects { stations: [...] }
	c.JSON(http.StatusOK, gin.H{
		"stations": stations,
	})
}
