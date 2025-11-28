package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateOrderRequest struct {
	TrainNo    string `json:"trainNo" binding:"required"`
	SeatType   string `json:"seatType" binding:"required"`
	Passengers []struct {
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

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Start Transaction
	tx := db.GetDB().Begin()

	// 3. Create Order
	// Note: In real logic, we need to find TrainServiceID, FromStationID, ToStationID, SegmentID based on TrainNo and user selection
	// For this skeleton, we'll mock/assume these IDs or insert dummy values as per "Start Backend Development" instruction
	// The DB Trigger `trg_ticket_decrement` relies on these IDs pointing to real `segment_seat_inventory`.
	// Since we don't have the search logic to get these IDs yet, we will use placeholders or look them up if tables existed.
	// For strict adherence to the interface, we create the order.

	orderID := uuid.New()
	order := models.Order{
		ID:              orderID,
		UserID:          userID,
		TrainServiceID:  1,             // Dummy
		FromStationID:   uuid.New(),    // Dummy
		ToStationID:     uuid.New(),    // Dummy
		SegmentID:       1,             // Dummy
		Status:          "pending_payment",
		TotalPriceCents: 10000 * len(req.Passengers), // Dummy price
		CreatedAt:       time.Now(),
		ExpiresAt:       time.Now().Add(30 * time.Minute),
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
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
			PriceCents:        10000,
			Status:            "active",
			CreatedAt:         time.Now(),
		}
		if p.ID != "" {
			pid, _ := uuid.Parse(p.ID)
			ticket.PassengerID = &pid
		}

		if err := tx.Create(&ticket).Error; err != nil {
			tx.Rollback()
			// Check if error is due to trigger (Not enough seats)
			if strings.Contains(err.Error(), "not enough seats") {
				c.JSON(http.StatusConflict, gin.H{"error": "Not enough seats"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket"})
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

	var orders []models.Order
	query := db.GetDB().Where("user_id = ?", userID)
	
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// TODO: Load tickets for each order if needed
	c.JSON(http.StatusOK, orders)
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
