package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"12306-backend/db"
	"12306-backend/models"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCreateOrder(t *testing.T) {
	r := setupTestRouter()

	// Create mock user for session
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().FirstOrCreate(&models.User{
		ID:           userID,
		Username:     "testuser",
		PasswordHash: "hash",
	})

	// Setup necessary data for CreateOrder: TrainService, Stations, Segment, and v_train_search entry
	bjpID := uuid.New()
	shhID := uuid.New()
	bjp := models.Station{ID: bjpID, Code: "BJP_O", NameEn: "Beijing Order", NameZh: "北京下单"}
	shh := models.Station{ID: shhID, Code: "SHH_O", NameEn: "Shanghai Order", NameZh: "上海下单"}
	db.GetDB().Where("code = ?", bjp.Code).FirstOrCreate(&bjp)
	db.GetDB().Where("code = ?", shh.Code).FirstOrCreate(&shh)
	
	trainNo := "G101_UNIQUE"
	serviceDate := time.Now() // Today
	// Use raw SQL to ensure date format matches what CreateOrder expects (YYYY-MM-DD string in SQLite)
	db.GetDB().Exec("INSERT INTO train_services (train_no, service_date) VALUES (?, ?)", trainNo, serviceDate.Format("2006-01-02"))
	
	var trainService models.TrainService
	db.GetDB().Where("train_no = ?", trainNo).First(&trainService)

	segment := models.ServiceSegment{
		TrainServiceID: trainService.ID,
		FromStationID:  bjp.ID,
		ToStationID:    shh.ID,
		DepartTime:     "08:00:00",
		ArriveTime:     "12:00:00",
	}
	db.GetDB().Create(&segment)

	// Mock v_train_search for price lookup
	seatsJSON := `[{"type":"second","price":50000,"left":100,"bookable":true}]`
	
	// Let's Drop and Recreate in TestCreateOrder.
	db.GetDB().Exec("DROP VIEW IF EXISTS v_train_search")
	db.GetDB().Exec("DROP TABLE IF EXISTS v_train_search")
	// Note: using 'uuid' type for station_ids in sqlite might be text, but let's assume text for test table.
	db.GetDB().Exec("CREATE TABLE v_train_search (train_no text, depart_time text, arrive_time text, from_station_id text, to_station_id text, date text, seats text)")
	
	db.GetDB().Exec("INSERT INTO v_train_search (train_no, depart_time, arrive_time, from_station_id, to_station_id, date, seats) VALUES (?, ?, ?, ?, ?, ?, ?)",
		trainNo, "08:00", "12:00", bjp.ID.String(), shh.ID.String(), serviceDate.Format("2006-01-02"), seatsJSON)

	t.Run("Success", func(t *testing.T) {
		pID := uuid.New().String()
		payload := map[string]interface{}{
			"trainNo":  trainNo,
			"seatType": "second",
			"passengers": []map[string]string{
				{"id": pID, "name": "P1", "card_no": "123"},
			},
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/orders", bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Expect 201 Created and Order ID
		assert.Equal(t, http.StatusCreated, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Contains(t, response, "orderId")
	})

	t.Run("NotEnoughSeats", func(t *testing.T) {
		// Mock inventory 0
		// Expect 409 Conflict
	})
}

func TestGetOrderInfo(t *testing.T) {
	r := setupTestRouter()

	// 1. Setup Data
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().FirstOrCreate(&models.User{
		ID:           userID,
		Username:     "testuser_info",
		PasswordHash: "hash",
	})

	// Stations
	bjpID := uuid.New()
	shhID := uuid.New()
	bjp := models.Station{ID: bjpID, Code: "BJP_TEST", NameEn: "Beijing Test", NameZh: "北京测试"}
	shh := models.Station{ID: shhID, Code: "SHH_TEST", NameEn: "Shanghai Test", NameZh: "上海测试"}
	// Use FirstOrCreate to avoid duplicates if re-running
	db.GetDB().Where("code = ?", bjp.Code).FirstOrCreate(&bjp)
	db.GetDB().Where("code = ?", shh.Code).FirstOrCreate(&shh)

	// Populate Mock View for Search
	trainNo := "G999_TEST"
	date := "2025-12-15"
	seatsJSON := `[{"type":"second","price":55300,"left":50,"bookable":true}]`
	
	db.GetDB().Exec("INSERT INTO v_train_search (train_no, depart_time, arrive_time, from_station_id, to_station_id, date, seats) VALUES (?, ?, ?, ?, ?, ?, ?)", 
		trainNo, "08:00", "12:00", bjp.ID.String(), shh.ID.String(), date, seatsJSON)

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/orders/new?trainNo=G999_TEST&departureStation=北京测试&arrivalStation=上海测试&departureDate=2025-12-15", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		// Check TrainInfo
		if trainInfo, ok := response["trainInfo"].(map[string]interface{}); ok {
			assert.Equal(t, "G999_TEST", trainInfo["trainNo"])
		} else {
			t.Error("trainInfo missing or invalid")
		}
		
		// Check FareInfo
		if fareInfo, ok := response["fareInfo"].(map[string]interface{}); ok {
			assert.Equal(t, 55300.0, fareInfo["second"])
		} else {
			t.Error("fareInfo missing or invalid")
		}
	})
}

func TestOrderConfirmationAndPayment(t *testing.T) {
	r := setupTestRouter()
	
	// Setup Data
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().FirstOrCreate(&models.User{
		ID:           userID,
		Username:     "testuser_confirm",
		PasswordHash: "hash",
	})

	// Train & Route
	trainService := models.TrainService{TrainNo: "G666", ServiceDate: time.Now()}
	db.GetDB().Create(&trainService)
	
	bjp := models.Station{Code: "BJP_C", NameZh: "北京Confirm", NameEn: "BeijingConfirm"}
	shh := models.Station{Code: "SHH_C", NameZh: "上海Confirm", NameEn: "ShanghaiConfirm"}
	db.GetDB().Where(models.Station{Code: "BJP_C"}).FirstOrCreate(&bjp)
	db.GetDB().Where(models.Station{Code: "SHH_C"}).FirstOrCreate(&shh)

	segment := models.ServiceSegment{
		TrainServiceID: trainService.ID,
		FromStationID:  bjp.ID,
		ToStationID:    shh.ID,
		DepartTime:     "10:00:00",
		ArriveTime:     "14:00:00",
	}
	db.GetDB().Create(&segment)

	// Order
	orderID := uuid.New()
	order := models.Order{
		ID:              orderID,
		UserID:          userID,
		TrainServiceID:  trainService.ID,
		FromStationID:   bjp.ID,
		ToStationID:     shh.ID,
		SegmentID:       segment.ID,
		Status:          "pending_payment",
		TotalPriceCents: 10000,
		CreatedAt:       time.Now(),
		ExpiresAt:       time.Now().Add(30 * time.Minute),
	}
	db.GetDB().Create(&order)

	// Ticket
	ticket := models.Ticket{
		OrderID:           orderID,
		PassengerName:     "ConfirmPassenger",
		PassengerCardNo:   "123456",
		PassengerCardType: "id_card",
		SeatType:          "second",
		TicketType:        "adult",
		PriceCents:        10000,
		Status:            "active",
	}
	db.GetDB().Create(&ticket)

	t.Run("GetOrderConfirmation", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/orders/"+orderID.String()+"/confirmation", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Contains(t, resp, "trainInfo")
		assert.Contains(t, resp, "passengers")
	})

	t.Run("ConfirmOrder", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v1/orders/"+orderID.String()+"/confirm", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("GetPayment", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/orders/"+orderID.String()+"/payment", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Equal(t, float64(100), resp["totalPrice"])
		assert.Contains(t, resp, "timeRemaining")
	})
}

func TestGetOrders(t *testing.T) {
	r := setupTestRouter()

	// Setup Data
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().FirstOrCreate(&models.User{
		ID:           userID,
		Username:     "testuser_orders",
		PasswordHash: "hash",
	})

	trainService := models.TrainService{TrainNo: "G888", ServiceDate: time.Now()}
	db.GetDB().Create(&trainService)

	bjp := models.Station{Code: "BJP_O", NameZh: "Beijing Orders", NameEn: "BeijingOrders"}
	shh := models.Station{Code: "SHH_O", NameZh: "Shanghai Orders", NameEn: "ShanghaiOrders"}
	db.GetDB().Where(models.Station{Code: "BJP_O"}).FirstOrCreate(&bjp)
	db.GetDB().Where(models.Station{Code: "SHH_O"}).FirstOrCreate(&shh)

	segment := models.ServiceSegment{
		TrainServiceID: trainService.ID,
		FromStationID:  bjp.ID,
		ToStationID:    shh.ID,
		DepartTime:     "09:00:00",
		ArriveTime:     "13:00:00",
	}
	db.GetDB().Create(&segment)

	// Order 1: Pending Payment
	order1 := models.Order{
		UserID:          userID,
		TrainServiceID:  trainService.ID,
		FromStationID:   bjp.ID,
		ToStationID:     shh.ID,
		SegmentID:       segment.ID,
		Status:          "pending_payment",
		TotalPriceCents: 5000,
		CreatedAt:       time.Now().Add(-1 * time.Hour),
	}
	db.GetDB().Create(&order1)

	// Order 2: Paid
	order2 := models.Order{
		UserID:          userID,
		TrainServiceID:  trainService.ID,
		FromStationID:   bjp.ID,
		ToStationID:     shh.ID,
		SegmentID:       segment.ID,
		Status:          "paid",
		TotalPriceCents: 6000,
		CreatedAt:       time.Now(),
	}
	db.GetDB().Create(&order2)
    
    // Ticket for Order 2
    ticket2 := models.Ticket{
        OrderID: order2.ID,
        PassengerName: "P2",
        SeatType: "second",
        PriceCents: 6000,
		Status: "active",
    }
    db.GetDB().Create(&ticket2)

	t.Run("GetAllOrders", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/orders", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Len(t, resp, 2)
        // Verify sorting (created_at desc) -> Order 2 first
        assert.Equal(t, order2.ID.String(), resp[0]["orderId"])
        // Verify fields
        assert.Equal(t, "G888", resp[0]["trainNo"])
        assert.Equal(t, "Beijing Orders", resp[0]["fromStation"])
        assert.Equal(t, "Shanghai Orders", resp[0]["toStation"])
        assert.Equal(t, "09:00:00", resp[0]["departTime"])
        
        // Verify tickets
        tickets := resp[0]["tickets"].([]interface{})
        assert.Len(t, tickets, 1)
        ticket := tickets[0].(map[string]interface{})
        assert.Equal(t, "P2", ticket["passenger_name"])
	})

    t.Run("FilterByStatus", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/orders?status=pending_payment", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Len(t, resp, 1)
        assert.Equal(t, order1.ID.String(), resp[0]["orderId"])
    })
    
    t.Run("FilterByCancelled", func(t *testing.T) {
        // Create cancelled order
        order3 := models.Order{UserID: userID, TrainServiceID: trainService.ID, FromStationID: bjp.ID, ToStationID: shh.ID, SegmentID: segment.ID, Status: "canceled", CreatedAt: time.Now(), TotalPriceCents: 100}
        db.GetDB().Create(&order3)
        
		req, _ := http.NewRequest("GET", "/api/v1/orders?status=cancelled", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Len(t, resp, 1)
        assert.Equal(t, order3.ID.String(), resp[0]["orderId"])
    })
}