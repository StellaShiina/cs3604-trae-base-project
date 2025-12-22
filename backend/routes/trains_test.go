package routes

import (
	"12306-backend/db"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSearchTrains(t *testing.T) {
	r := setupTestRouter()

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/trains/search?fromStationId=uuid1&toStationId=uuid2&date=2025-11-28", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		// TODO: Parse body and check structure
	})

	// Add Test for City Aggregation (Scenario: 城市聚合查询)
	// Given 城市 "北京" (BJP) 包含车站 "北京南" (VNP) 和 "北京西" (BXP)
	// When 调用 "查询车次" API，参数为 fromStation="BJP" (City Code)
	// Then 响应结果应包含车次 "G1" (From VNP) and "Z1" (From BXP) if exists
	t.Run("FilterPastTrainsOnSameDay", func(t *testing.T) {
		// Create mock view table if not exists (it should exist from orders_test.go, but safe to ensure)
		// Or assume it exists.
		
		today := time.Now().Format("2006-01-02")
		id1 := "11111111-1111-1111-1111-111111111111"
		id2 := "22222222-2222-2222-2222-222222222222"
		
		// Insert Mock Stations
		// Note: db.GetDB().Exec works, but might need to handle conflicts if run multiple times?
		// In-memory DB is fresh per test run usually? 
		// `setupTestRouter` calls `db.InitTest()` which creates a NEW random DB name every time?
		// orders_test.go: "file:memdb%d..." -> Yes.
		// BUT `setupTestRouter` is called inside `TestSearchTrains`.
		// So this is a fresh DB.
		
		db.GetDB().Exec("INSERT INTO stations (id, code, name_en, name_zh) VALUES (?, ?, ?, ?)", id1, "CODE1", "Station1", "StationZh1")
		db.GetDB().Exec("INSERT INTO stations (id, code, name_en, name_zh) VALUES (?, ?, ?, ?)", id2, "CODE2", "Station2", "StationZh2")
		
		// Insert Past Train (00:00)
		db.GetDB().Exec("INSERT INTO v_train_search (train_service_id, train_no, depart_time, arrive_time, from_station_id, to_station_id, date, seats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			"100", "G_PAST", "00:00", "01:00", id1, id2, today, `[]`)
			
		// Insert Future Train (23:59)
		db.GetDB().Exec("INSERT INTO v_train_search (train_service_id, train_no, depart_time, arrive_time, from_station_id, to_station_id, date, seats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			"101", "G_FUTURE", "23:59", "23:59", id1, id2, today, `[]`)
			
		req, _ := http.NewRequest("GET", "/api/v1/trains/search?fromStationId="+id1+"&toStationId="+id2+"&date="+today, nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		
		assert.Equal(t, http.StatusOK, w.Code)
		
		var results []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &results)
		
		// Should contain G_FUTURE, should NOT contain G_PAST
		foundPast := false
		foundFuture := false
		for _, r := range results {
			if r["trainNo"] == "G_PAST" {
				foundPast = true
			}
			if r["trainNo"] == "G_FUTURE" {
				foundFuture = true
			}
		}
		
		assert.False(t, foundPast, "Should not return past trains")
		assert.True(t, foundFuture, "Should return future trains")
	})
}

func TestGetStations(t *testing.T) {
	r := setupTestRouter()

	t.Run("Success_AllStations", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/stations", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		// Check JSON structure: {"stations": [...]}
	})
}
