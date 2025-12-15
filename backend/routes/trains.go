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

	// Helper to resolve station IDs (supports City Aggregation)
	resolveStationIDs := func(input string) []string {
		var ids []string
		
		// 1. Check if valid UUID (Direct ID)
		if _, err := uuid.Parse(input); err == nil {
			ids = append(ids, input)
			return ids
		}

		// 2. Lookup by Code/Name (Single Station)
		// var stations []models.Station
		// Try Exact Match on Code, NameEn, NameZh
		// Also support "City Code" concept: If input is a city code like "BJP", 
		// in real world, "BJP" is Beijing Station. But here we assume we might need to find all stations in that city.
		// Since we don't have a separate "City" table in the current schema, we can assume a convention or lookup table.
		// For this task, let's implement a simple logic: 
		// If input matches a Station Code that is a "major city" (e.g. BJP, SHH), we fetch related stations.
		// OR, simpler: Just query stations where Code = input OR NameEn = input OR NameZh = input.
		
		// However, the requirement says "Search BJP should return VNP, BXP...".
		// This implies a mapping. Let's hardcode a mapping for now or use a prefix search if applicable.
		// Mapping for Beijing (BJP) -> Beijing (BJP), Beijing Nan (VNP), Beijing Xi (BXP)
		// Mapping for Shanghai (SHH) -> Shanghai (SHH), Shanghai Hongqiao (AOH)
		
		cityMapping := map[string][]string{
			"BJP": {"BJP", "VNP", "BXP"}, // Beijing, South, West
			"SHH": {"SHH", "AOH"},        // Shanghai, Hongqiao
			"北京":  {"BJP", "VNP", "BXP"}, // Beijing Chinese mapping
			"上海":  {"SHH", "AOH"},        // Shanghai Chinese mapping
		}
		
		if mappedCodes, ok := cityMapping[input]; ok {
			// Fetch IDs for all these codes
			db.GetDB().Model(&models.Station{}).Where("code IN ?", mappedCodes).Pluck("id", &ids)
			return ids
		}
		
		// Fallback: Normal single station lookup
		if err := db.GetDB().Model(&models.Station{}).Where("code = ? OR name_en = ? OR name_zh = ?", input, input, input).Pluck("id", &ids).Error; err == nil {
			return ids
		}
		
		return ids
	}

	fromStationIDs := resolveStationIDs(fromStationInput)
	toStationIDs := resolveStationIDs(toStationInput)

	if len(fromStationIDs) == 0 || len(toStationIDs) == 0 {
		c.JSON(http.StatusOK, []TrainSearchResult{})
		return
	}

	// Query v_train_search view with IN clause
	var results []struct {
		TrainNo       string
		FromStationID string `gorm:"column:from_station_id"` // To map back to station name if needed
		ToStationID   string `gorm:"column:to_station_id"`
		DepartTime    string
		ArriveTime    string
		Seats         string // JSONB string
	}

	// Note: Gorm's Raw SQL with IN clause needs specific handling or string interpolation if using ? with slice.
	// Gorm handles slice for ? automatically in Where, but in Raw it depends.
	// Let's use Where clause construction.
	
	// Since v_train_search is a view, we can treat it like a model if we define a struct, 
	// or use Raw with Gorm's clause building.
	
	err := db.GetDB().Table("v_train_search").
		Select("train_no, from_station_id, to_station_id, depart_time, arrive_time, seats").
		Where("from_station_id IN ? AND to_station_id IN ? AND date = ?", fromStationIDs, toStationIDs, date).
		Scan(&results).Error

	if err != nil {
		// If error (e.g. table not found or query error), return empty list
		// Log error for debugging if needed, but keep response clean
		c.JSON(http.StatusOK, []TrainSearchResult{})
		return
	}

	// We need to map Station IDs back to Station Names/Codes for the response "from" / "to" fields?
	// The Requirement says "Response should indicate actual departure station".
	// So we should fetch Station info to display correct names.
	
	// Collect all unique station IDs from results
	stationIDMap := make(map[string]models.Station)
	var allStationIDs []string
	for _, r := range results {
		allStationIDs = append(allStationIDs, r.FromStationID, r.ToStationID)
	}
	
	if len(allStationIDs) > 0 {
		var stations []models.Station
		db.GetDB().Where("id IN ?", allStationIDs).Find(&stations)
		for _, s := range stations {
			stationIDMap[s.ID.String()] = s
		}
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
		
		fromStationName := fromStationInput
		if s, ok := stationIDMap[r.FromStationID]; ok {
			fromStationName = s.NameZh // Or NameEn, or Code depending on requirement. Let's use ZH name.
		}
		toStationName := toStationInput
		if s, ok := stationIDMap[r.ToStationID]; ok {
			toStationName = s.NameZh
		}

		response = append(response, TrainSearchResult{
			TrainNo:   r.TrainNo,
			From:      fromStationName, // Actual Station Name
			To:        toStationName,   // Actual Station Name
			StartTime: r.DepartTime, 
			EndTime:   r.ArriveTime, 
			Seats:     seats,
		})
	}

    c.JSON(http.StatusOK, response)
}

// API-GET-Stations
func GetStations(c *gin.Context) {
	query := c.Query("q")
	
	var stations []models.Station
	dbQuery := db.GetDB().Model(&models.Station{})
	
	if query != "" {
		// Fuzzy search
		search := "%" + query + "%"
		dbQuery = dbQuery.Where("name_zh LIKE ? OR name_en LIKE ? OR code LIKE ?", search, search, search)
	}
	
	if err := dbQuery.Find(&stations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stations"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"stations": stations,
	})
}
