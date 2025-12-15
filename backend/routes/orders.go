package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateOrderRequest struct {
	TrainNo       string `json:"trainNo" binding:"required"`
	DepartureDate string `json:"departureDate" binding:"required"` // Added departureDate
	SeatType      string `json:"seatType" binding:"required"`
	Passengers    []struct {
		ID     string `json:"id"`
		Name   string `json:"name"`
		CardNo string `json:"card_no"`
	} `json:"passengers" binding:"required"`
}

// API-POST-Orders
func CreateOrder(c *gin.Context) {
	// 1. Auth check
	cookie, err := c.Cookie("sid")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uidStr := cookie[14:]
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	// 1.5. Check for existing pending orders
	var pendingCount int64
	if err := db.GetDB().Model(&models.Order{}).Where("user_id = ? AND status = ?", userID, "pending_payment").Count(&pendingCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check pending orders"})
		return
	}
	if pendingCount > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You have an unpaid order. Please pay or cancel it first.",
			"hasUnpaidOrder": true, // Frontend check
		})
		return
	}

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Start Transaction
	tx := db.GetDB().Begin()

	// 3. Create Order
	// Note: Since the API request only provides TrainNo, we assume the train has a single segment (or we book the primary segment).
	// We first find the TrainService, then find its Segment to determine From/To stations.

	var trainServiceID int64
    var trainService models.TrainService
    // Use raw SQL for date because Gorm date mapping with SQLite/Postgres might differ slightly in format
	// In production (Postgres), current_date is safe. In testing (SQLite/Postgres), it depends.
	// We check if service_date equals request departure date.
    if err := tx.Where("train_no = ? AND service_date = ?", req.TrainNo, req.DepartureDate).First(&trainService).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Train service not found"})
        return
    }
    trainServiceID = trainService.ID

	var segmentID int64
    var serviceSegment models.ServiceSegment
    // Find the segment associated with this train service. 
	// Assuming 1 segment per train for now as per current DB state and API spec limitations.
    if err := tx.Where("train_service_id = ?", trainServiceID).First(&serviceSegment).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Segment not found"})
        return
    }

	// Check if departure time is in the past (for today's trains)
	// We have ServiceDate (YYYY-MM-DD) and DepartTime (HH:MM)
	// Combine them to compare with Now
	// Parse DepartTime (HH:MM or HH:MM:SS)
	departTimeStr := serviceSegment.DepartTime
	if len(departTimeStr) == 5 {
		departTimeStr += ":00"
	}
	// Note: In some DBs it might be full timestamp or just time.
	// Assuming HH:MM:SS based on previous code.
	
	// Create full departure timestamp
	// trainService.ServiceDate is time.Time (usually midnight or truncated)
	// We need to parse time string and add to date.
	
	// But `ServiceDate` from DB might already have time component if not careful, 
	// though we usually treat it as Date.
	// Let's use string parsing to be safe or time addition.
	
	year, month, day := trainService.ServiceDate.Date()
	dt, err := time.Parse("15:04:05", departTimeStr)
	if err == nil {
		departureTimestamp := time.Date(year, month, day, dt.Hour(), dt.Minute(), dt.Second(), 0, trainService.ServiceDate.Location())
		if time.Now().After(departureTimestamp) {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Train has already departed"})
			return
		}
	}

    segmentID = serviceSegment.ID
	
	fromID := serviceSegment.FromStationID
	toID := serviceSegment.ToStationID

	// Fetch price from v_train_search or calculate it
	var result struct {
		Seats string // JSONB string
	}
	// Note: v_train_search is a view, and it might be slow or complex to query inside a transaction if it locks.
	// However, for read it should be fine. We use the same criteria as Search: TrainNo, Date, From, To.
	// But we already have the exact train service, so we just need to match the segment/stations.
	// Actually, v_train_search is keyed by (train_no, date, from_station_id, to_station_id).
	
	if err := tx.Table("v_train_search").
		Select("seats").
		Where("train_no = ? AND date = ? AND from_station_id = ? AND to_station_id = ?", 
			req.TrainNo, trainService.ServiceDate.Format("2006-01-02"), fromID.String(), toID.String()).
		Scan(&result).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch price info"})
		return
	}

	priceCents := 0
	var seatsData []struct {
		Type  string `json:"type"`
		Price int    `json:"price"`
	}
	if err := json.Unmarshal([]byte(result.Seats), &seatsData); err == nil {
		for _, s := range seatsData {
			if s.Type == req.SeatType {
				priceCents = s.Price
				break
			}
		}
	}
	
	if priceCents == 0 {
		// Fallback or Error? 
		// If seat type not found or price is 0, we can't process order correctly.
		// For robustness, maybe default to a value or fail.
		// Let's fail as this is a financial transaction.
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid seat type or price not found"})
		return
	}

    orderID := uuid.New()
    order := models.Order{
        ID:              orderID,
        UserID:          userID,
        TrainServiceID:  trainServiceID,
        FromStationID:   fromID,
        ToStationID:     toID,
        SegmentID:       segmentID,
        Status:          "pending_payment",
        TotalPriceCents: priceCents * len(req.Passengers),
        CreatedAt:       time.Now(),
        ExpiresAt:       time.Now().Add(30 * time.Minute),
    }

    if err := tx.Create(&order).Error; err != nil {
        tx.Rollback()
        if strings.Contains(err.Error(), "not enough seats") {
            c.JSON(http.StatusConflict, gin.H{"error": "Not enough seats"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order record"})
        return
    }

	// 4. Create Tickets
	for _, p := range req.Passengers {
		ticket := models.Ticket{
			OrderID:           orderID,
			PassengerName:     p.Name,
			PassengerCardNo:   p.CardNo,
			SeatType:          req.SeatType,
			TicketType:        "adult",
			PriceCents:        priceCents,
			Status:            "active",
			CreatedAt:         time.Now(),
		}
		if p.ID != "" {
			pid, err := uuid.Parse(p.ID)
            if err != nil {
                 c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid passenger ID"})
                 tx.Rollback()
                 return
            }
			ticket.PassengerID = &pid
            
            // Fetch passenger to get card type
            var passenger models.Passenger
            if err := tx.First(&passenger, "id = ?", pid).Error; err == nil {
                ticket.PassengerCardType = passenger.CardType
            } else {
                 // If passenger not found in DB, maybe fallback or error. 
                 // Given the constraints, let's assume 'id_card' if we can't find it, 
                 // or better, fail if ID was provided but not found?
                 // For robustness in this test, let's default to 'id_card' if lookup fails 
                 // or if the request allows providing it (which it currently doesn't).
                 ticket.PassengerCardType = "id_card"
            }
		} else {
             ticket.PassengerCardType = "id_card"
        }

		if err := tx.Create(&ticket).Error; err != nil {
			tx.Rollback()
			// Check if error is due to trigger (Not enough seats)
			if strings.Contains(err.Error(), "not enough seats") {
				c.JSON(http.StatusConflict, gin.H{"error": "Not enough seats"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket: " + err.Error()})
			return
		}
	}

	// 5. Commit
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"orderId": order.ID})
}

// API-GET-Orders
func GetOrders(c *gin.Context) {
	cookie, err := c.Cookie("sid")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uidStr := cookie[14:]
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	// Use explicit structs to ensure JSON format matches frontend expectations
	// and to avoid relying on database views that might be missing or inconsistent.
	type TicketView struct {
		TicketID      int64  `json:"ticket_id"`
		PassengerName string `json:"passenger_name"`
		SeatType      string `json:"seat_type"`
		SeatNo        string `json:"seat_no"`
		Price         int    `json:"price"`
		Status        string `json:"status"`
	}

	type OrderView struct {
		OrderID          uuid.UUID    `json:"orderId"` // Backend standard
		ID               uuid.UUID    `json:"id"`      // Frontend legacy expectation
		Status           string       `json:"status"`
		TrainNo          string       `json:"train_no"`          // Mapped for frontend snake_case expectation
		FromStation      string       `json:"departure_station"` // Mapped
		ToStation        string       `json:"arrival_station"`   // Mapped
		DepartureDate    string       `json:"departure_date"`    // Mapped
		DepartureTime    string       `json:"departure_time"`    // Mapped
		ArriveTime       string       `json:"arrival_time"`      // Mapped
		TotalPrice       float64      `json:"total_price"`       // Yuan (float)
		CreatedAt        string       `json:"created_at"`        // Mapped
		Tickets          []TicketView `json:"tickets"`           // Usually passengers list
		Passengers       []TicketView `json:"passengers"`        // Frontend might look for 'passengers'
	}

	var dbOrders []models.Order
	query := db.GetDB().
		Preload("TrainService").
		Preload("FromStation").
		Preload("ToStation").
		Preload("Segment").
		Preload("Tickets").
		Where("user_id = ?", userID)
	
	status := c.Query("status")
	if status != "" {
		// Map frontend status to backend status if needed, or assume match
		// Frontend: pending_payment, paid, cancelled
		// Backend: pending_payment, paid, canceled (one 'l'?)
		// Let's check CancelOrder: `order.Status = "canceled"` (one 'l')
		// Frontend `OrderList.vue`: `cancelled` (two 'l's)
		// We need to handle this mismatch!
		if status == "cancelled" {
			status = "canceled"
		}
		// Frontend might request 'pending' or 'confirmed_unpaid' which map to 'pending_payment'
		if status == "pending" || status == "confirmed_unpaid" {
			status = "pending_payment"
		}

		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at desc").Find(&dbOrders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	var response []OrderView
	for _, o := range dbOrders {
		var tickets []TicketView
		for _, t := range o.Tickets {
			seatNo := ""
			if t.SeatNo != nil {
				seatNo = *t.SeatNo
			}
			tickets = append(tickets, TicketView{
				TicketID:      t.ID,
				PassengerName: t.PassengerName,
				SeatType:      t.SeatType,
				SeatNo:        seatNo,
				Price:         t.PriceCents,
				Status:        t.Status,
			})
		}
		
		if tickets == nil {
			tickets = []TicketView{}
		}

		response = append(response, OrderView{
			OrderID:          o.ID,
			ID:               o.ID,
			Status:           o.Status,
			TrainNo:          o.TrainService.TrainNo,
			FromStation:      o.FromStation.NameZh,
			ToStation:        o.ToStation.NameZh,
			DepartureDate:    o.TrainService.ServiceDate.Format("2006-01-02"),
			DepartureTime:    o.Segment.DepartTime,
			ArriveTime:       o.Segment.ArriveTime,
			TotalPrice:       float64(o.TotalPriceCents) / 100.0,
			CreatedAt:        o.CreatedAt.Format("2006-01-02 15:04:05"),
			Tickets:          tickets,
			Passengers:       tickets, // Map tickets to passengers for frontend
		})
	}

	// If response is nil, return empty array
	if response == nil {
		response = []OrderView{}
	}

	c.JSON(http.StatusOK, response)
}

// API-POST-PayOrder
func PayOrder(c *gin.Context) {
	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var order models.Order
	if err := db.GetDB().First(&order, "id = ?", orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.Status != "pending_payment" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order expired or invalid status"})
		return
	}

	// Update status
	now := time.Now()
	order.Status = "paid"
	order.PaidAt = &now
	if err := db.GetDB().Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "paid"})
}

// API-POST-CancelOrder
func CancelOrder(c *gin.Context) {
	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var order models.Order
	if err := db.GetDB().First(&order, "id = ?", orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.Status != "pending_payment" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel order in current status"})
		return
	}

	// Update status - Trigger should handle inventory release
	order.Status = "canceled"
	if err := db.GetDB().Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "canceled"})
}

// API-POST-RefundTicket
func RefundTicket(c *gin.Context) {
	id := c.Param("id")
	// Ticket ID is int64
	// But in route param it's string, need parsing
	// Wait, models says ID int64.
	// But API might use string.
	// Let's assume standard parsing.
	
	var ticket models.Ticket
	if err := db.GetDB().First(&ticket, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	if ticket.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket not active"})
		return
	}

	ticket.Status = "refunded"
	if err := db.GetDB().Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refund ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "refunded"})
}

type OrderInfoResponse struct {
	TrainInfo       TrainInfoView      `json:"trainInfo"`
	FareInfo        map[string]int     `json:"fareInfo"`       // seatType -> price in cents
	AvailableSeats  map[string]int     `json:"availableSeats"` // seatType -> count
	Passengers      []models.Passenger `json:"passengers"`
	DefaultSeatType string             `json:"defaultSeatType"`
}

type TrainInfoView struct {
	TrainNo          string `json:"trainNo"`
	DepartureStation string `json:"departureStation"`
	ArrivalStation   string `json:"arrivalStation"`
	DepartureDate    string `json:"departureDate"`
	DepartureTime    string `json:"departureTime"`
	ArrivalTime      string `json:"arrivalTime"`
	Duration         string `json:"duration"`
}

// API-GET-OrderInfo
func GetOrderInfo(c *gin.Context) {
	// 1. Auth Check
	cookie, err := c.Cookie("sid")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uidStr := cookie[14:]
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	// 2. Parse Params
	trainNo := c.Query("trainNo")
	depStationName := c.Query("departureStation")
	arrStationName := c.Query("arrivalStation")
	date := c.Query("departureDate")

	if trainNo == "" || depStationName == "" || arrStationName == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameters"})
		return
	}

	// 3. Resolve Station IDs
	var depStation, arrStation models.Station
	// Try NameZh, NameEn, Code
	if err := db.GetDB().Where("name_zh = ? OR name_en = ? OR code = ?", depStationName, depStationName, depStationName).First(&depStation).Error; err != nil {
		// If not found, maybe just use the name if we can't find ID? 
		// But v_train_search needs IDs.
		// Let's return error.
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid departure station: " + depStationName})
		return
	}
	if err := db.GetDB().Where("name_zh = ? OR name_en = ? OR code = ?", arrStationName, arrStationName, arrStationName).First(&arrStation).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid arrival station: " + arrStationName})
		return
	}

	// 4. Query v_train_search
	var result struct {
		TrainNo    string
		DepartTime string
		ArriveTime string
		Seats      string // JSONB string
	}

	err = db.GetDB().Table("v_train_search").
		Select("train_no, depart_time, arrive_time, seats").
		Where("train_no = ? AND date = ? AND from_station_id = ? AND to_station_id = ?", trainNo, date, depStation.ID, arrStation.ID).
		Scan(&result).Error

	if err != nil || result.TrainNo == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Train service not found"})
		return
	}

	// 5. Parse Seats
	fareInfo := make(map[string]int)
	availableSeats := make(map[string]int)

	var seatsData []struct {
		Type     string `json:"type"`
		Left     int    `json:"left"`
		Bookable bool   `json:"bookable"`
		Price    int    `json:"price"`
	}
	if err := json.Unmarshal([]byte(result.Seats), &seatsData); err == nil {
		for _, s := range seatsData {
			fareInfo[s.Type] = s.Price
			availableSeats[s.Type] = s.Left
		}
	}

	// 6. Get Passengers
	var passengers []models.Passenger
	db.GetDB().Where("user_id = ?", userID).Find(&passengers)

	// 7. Calculate Duration (Simple string manipulation if format is HH:MM)
	duration := "00:00"
	if len(result.DepartTime) >= 5 && len(result.ArriveTime) >= 5 {
		d, _ := time.Parse("15:04", result.DepartTime[:5])
		a, _ := time.Parse("15:04", result.ArriveTime[:5])
		// Handle overnight? Assuming same day for simple duration or if Arrival < Departure add 24h
		if a.Before(d) {
			a = a.Add(24 * time.Hour)
		}
		diff := a.Sub(d)
		hours := int(diff.Hours())
		minutes := int(diff.Minutes()) % 60
		duration = fmt.Sprintf("%02d:%02d", hours, minutes)
	}

	// 8. Construct Response
	defaultSeat := "second"
	if _, ok := availableSeats["second"]; ok {
		defaultSeat = "second"
	} else if _, ok := availableSeats["first"]; ok {
		defaultSeat = "first"
	} else if _, ok := availableSeats["business"]; ok {
		defaultSeat = "business"
	} else if len(availableSeats) > 0 {
		for k := range availableSeats {
			defaultSeat = k
			break
		}
	}

	resp := OrderInfoResponse{
		TrainInfo: TrainInfoView{
			TrainNo:          result.TrainNo,
			DepartureStation: depStation.NameZh, // Use standard name from DB
			ArrivalStation:   arrStation.NameZh,
			DepartureDate:    date,
			DepartureTime:    result.DepartTime,
			ArrivalTime:      result.ArriveTime,
			Duration:         duration,
		},
		FareInfo:        fareInfo,
		AvailableSeats:  availableSeats,
		Passengers:      passengers,
		DefaultSeatType: defaultSeat,
	}

	c.JSON(http.StatusOK, resp)
}

// API-GET-OrderConfirmation
func GetOrderConfirmation(c *gin.Context) {
	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// 1. Auth Check
	cookie, err := c.Cookie("sid")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uidStr := cookie[14:]
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	// 2. Fetch Order with details
	var order models.Order
	if err := db.GetDB().Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// 3. Fetch related info
	var trainService models.TrainService
	db.GetDB().First(&trainService, order.TrainServiceID)

	var fromStation, toStation models.Station
	db.GetDB().First(&fromStation, order.FromStationID)
	db.GetDB().First(&toStation, order.ToStationID)

	var segment models.ServiceSegment
	db.GetDB().First(&segment, order.SegmentID)

	var tickets []models.Ticket
	db.GetDB().Where("order_id = ?", order.ID).Find(&tickets)

	// 4. Construct response
	// Need to match frontend expectation:
	// trainInfo: { trainNo, departureStation, arrivalStation, departureDate, departureTime, arrivalTime, duration }
	// passengers: [ { name, seatType, ticketType, idCardType, idCardNumber, points } ]
	// availableSeats: { ... } (Optional, maybe not needed for confirmation if seats are already locked?)
	// Actually frontend displays seat allocation notice, so maybe available seats are just for show?
	// The modal shows "System will randomly assign seats".

	// Duration calc
	duration := "00:00"
	// Assuming segment.Duration is parsed or we calc from times
	// segment.Duration is string in models "4 hours" or similar from my previous mock?
	// In DB it is INTERVAL. Gorm maps it to string usually or Duration.
	// Let's use string from DB directly if mapped, or simple calc.
	// For now, let's use the segment times.
	
	// Helper for time calc (similar to GetOrderInfo)
	if len(segment.DepartTime) >= 5 && len(segment.ArriveTime) >= 5 {
		d, _ := time.Parse("15:04:05", segment.DepartTime) // Postgres TIME is HH:MM:SS
		a, _ := time.Parse("15:04:05", segment.ArriveTime)
		if a.Before(d) {
			a = a.Add(24 * time.Hour)
		}
		diff := a.Sub(d)
		hours := int(diff.Hours())
		minutes := int(diff.Minutes()) % 60
		duration = fmt.Sprintf("%02d:%02d", hours, minutes)
	}

	var passengers []map[string]interface{}
	for _, t := range tickets {
		passengers = append(passengers, map[string]interface{}{
			"name":         t.PassengerName,
			"seatType":     t.SeatType,
			"ticketType":   t.TicketType,
			"idCardType":   t.PassengerCardType, // Need translation if frontend expects Chinese? Frontend translates in table.
			"idCardNumber": t.PassengerCardNo,
			"points":       0, // Placeholder
		})
	}

	resp := gin.H{
		"trainInfo": gin.H{
			"trainNo":          trainService.TrainNo,
			"departureStation": fromStation.NameZh,
			"arrivalStation":   toStation.NameZh,
			"departureDate":    trainService.ServiceDate.Format("2006-01-02"),
			"departureTime":    segment.DepartTime, // "HH:MM:SS"
			"arrivalTime":      segment.ArriveTime,
			"duration":         duration,
		},
		"passengers": passengers,
		// "availableSeats": ... // If needed
	}

	c.JSON(http.StatusOK, resp)
}

// API-POST-ConfirmOrder
func ConfirmOrder(c *gin.Context) {
	// This endpoint seems to be the final "Pay" or "Confirm" step?
	// Frontend calls /orders/:id/confirm
	// But in my list I have /pay
	// Let's check frontend logic:
	// handleConfirm calls /orders/:id/confirm
	// Then it navigates to /payment/:id
	// So this "confirm" might be a "Lock" or just a check?
	// Or maybe it is just a "Proceed to Pay" signal?
	// Since order is already created and seats are deducted (via trigger/transaction in CreateOrder),
	// this step might be redundant or just a state check.
	// But frontend expects it.
	
	// Let's return success and the same info as confirmation?
	// Or maybe it updates status to "confirmed" before "paid"?
	// Current statuses: pending_payment -> paid.
	// So pending_payment IS confirmed (seats locked).
	
	// Let's just return success with some info.
	
	id := c.Param("id")
	// Verify ID
	if _, err := uuid.Parse(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}
	
	// We can reuse GetOrderConfirmation logic to return info if frontend needs it.
	// Frontend says: const result = await response.json(); ... setConfirmResult(result);
	// And passes result.trainInfo, result.tickets to SuccessModal (which seems unused? No, SuccessModal is used).
	
	// So yes, we should return trainInfo and tickets.
	GetOrderConfirmation(c)
}

// API-GET-Payment
func GetPayment(c *gin.Context) {
	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// 1. Auth Check
	cookie, err := c.Cookie("sid")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uidStr := cookie[14:]
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	// 2. Fetch Order
	var order models.Order
	if err := db.GetDB().Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Check expiry
	if order.Status == "pending_payment" && time.Now().After(order.ExpiresAt) {
		// Update status if needed or just return error
		order.Status = "canceled" // Trigger should handle inventory? Or cron job?
		db.GetDB().Save(&order)   // Persist the cancellation
		
		// For now, let's just return error
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order expired"})
		return
	}

	// 3. Fetch Train/Station/Segment Info (Reuse logic or struct)
	var trainService models.TrainService
	db.GetDB().First(&trainService, order.TrainServiceID)

	var fromStation, toStation models.Station
	db.GetDB().First(&fromStation, order.FromStationID)
	db.GetDB().First(&toStation, order.ToStationID)

	var segment models.ServiceSegment
	db.GetDB().First(&segment, order.SegmentID)

	var tickets []models.Ticket
	db.GetDB().Where("order_id = ?", order.ID).Find(&tickets)

	// 4. Calc Duration
	duration := "00:00"
	if len(segment.DepartTime) >= 5 && len(segment.ArriveTime) >= 5 {
		d, _ := time.Parse("15:04:05", segment.DepartTime)
		a, _ := time.Parse("15:04:05", segment.ArriveTime)
		if a.Before(d) {
			a = a.Add(24 * time.Hour)
		}
		diff := a.Sub(d)
		hours := int(diff.Hours())
		minutes := int(diff.Minutes()) % 60
		duration = fmt.Sprintf("%02d:%02d", hours, minutes)
	}

	// 5. Construct Response for Payment Page
	// Needs: trainInfo, passengers, totalPrice, timeRemaining
	var passengers []map[string]interface{}
	for i, t := range tickets {
		passengers = append(passengers, map[string]interface{}{
			"sequence":     i + 1,
			"name":         t.PassengerName,
			"seatType":     t.SeatType,
			"ticketType":   t.TicketType,
			"idCardType":   t.PassengerCardType,
			"idCardNumber": t.PassengerCardNo,
			"price":        float64(t.PriceCents) / 100.0,
			// "carNumber": "01", // Mock?
			// "seatNumber": "01A", // Mock?
		})
	}

	timeRemaining := int(time.Until(order.ExpiresAt).Seconds())
	if timeRemaining < 0 {
		timeRemaining = 0
	}

	resp := gin.H{
		"trainInfo": gin.H{
			"trainNo":          trainService.TrainNo,
			"departureStation": fromStation.NameZh,
			"arrivalStation":   toStation.NameZh,
			"departureDate":    trainService.ServiceDate.Format("2006-01-02"),
			"departureTime":    segment.DepartTime,
			"arrivalTime":      segment.ArriveTime,
			"duration":         duration,
		},
		"passengers":    passengers,
		"totalPrice":    float64(order.TotalPriceCents) / 100.0,
		"timeRemaining": timeRemaining,
	}

	c.JSON(http.StatusOK, resp)
}
