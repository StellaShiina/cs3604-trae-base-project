package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TrainSearchResult struct {
	TrainNo   string `json:"trainNo"`
	From      string `json:"from"`
	To        string `json:"to"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Seats     []struct {
		Type     string `json:"type"`
		Left     int    `json:"left"`
		Bookable bool   `json:"bookable"`
		Price    int    `json:"price"`
	} `json:"seats"`
}

// API-GET-TrainSearch
func SearchTrains(c *gin.Context) {
	fromStationInput := c.Query("fromStationId")
	toStationInput := c.Query("toStationId")
	date := c.Query("date")

	if fromStationInput == "" || toStationInput == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required parameters"})
		return
	}

	// Helper to resolve station ID
	resolveStationID := func(input string) string {
		// Check if valid UUID
		if _, err := uuid.Parse(input); err == nil {
			return input
		}
		// Lookup by code or name
		var station models.Station
		// Try Code, NameEn, NameZh
		if err := db.GetDB().Where("code = ? OR name_en = ? OR name_zh = ?", input, input, input).First(&station).Error; err == nil {
			return station.ID.String()
		}
		return ""
	}

	fromStationID := resolveStationID(fromStationInput)
	toStationID := resolveStationID(toStationInput)

	if fromStationID == "" || toStationID == "" {
		c.JSON(http.StatusOK, []TrainSearchResult{})
		return
	}

	// Query v_train_search view
	var results []struct {
		TrainNo    string
		DepartTime string
		ArriveTime string
		Seats      string // JSONB string
	}

	err := db.GetDB().Raw(`
		SELECT train_no, depart_time, arrive_time, seats::text
		FROM v_train_search 
		WHERE from_station_id = ? AND to_station_id = ? AND date = ?
	`, fromStationID, toStationID, date).Scan(&results).Error

	if err != nil {
		// If error (e.g. table not found or query error), return empty list
		// Log error for debugging if needed, but keep response clean
		c.JSON(http.StatusOK, []TrainSearchResult{})
		return
	}

	// Map to response format
	var response []TrainSearchResult
	for _, r := range results {
		var seats []struct {
			Type     string `json:"type"`
			Left     int    `json:"left"`
			Bookable bool   `json:"bookable"`
			Price    int    `json:"price"`
		}
		if err := json.Unmarshal([]byte(r.Seats), &seats); err != nil {
			// If parsing fails, just use empty seats
			seats = []struct {
				Type     string `json:"type"`
				Left     int    `json:"left"`
				Bookable bool   `json:"bookable"`
				Price    int    `json:"price"`
			}{}
		}

		response = append(response, TrainSearchResult{
			TrainNo:   r.TrainNo,
			From:      fromStationInput,
			To:        toStationInput,
			StartTime: r.DepartTime, // Map depart_time to startTime
			EndTime:   r.ArriveTime, // Map arrive_time to endTime
			Seats:     seats,
		})
	}

    c.JSON(http.StatusOK, response)
}
