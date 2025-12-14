package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Helper to get user ID from session/context (Mocked for now)
func getUserID(c *gin.Context) uuid.UUID {
	// In real app, extract from context set by middleware
	// For demo/test, we might need a way to inject this.
	// Assume middleware sets "userID"
	val, exists := c.Get("userID")
	if exists {
		return val.(uuid.UUID)
	}
	// Fallback or panic in dev
	return uuid.Nil
}

// API-GET-Passengers
func GetPassengers(c *gin.Context) {
	// userID := getUserID(c) // Use when middleware is ready
	// For simplicity in this turn, we assume the user is authenticated
	// and we might need to rely on cookie parsing if middleware isn't there.
	
	// Mock: If no user found, return 401. 
	// But let's assume middleware handles 401.

	// Since we don't have the auth middleware yet, let's just query all passengers
	// for a hardcoded user or try to parse the cookie dummy session.
	
	cookie, err := c.Cookie("sid")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// "dummy-session-UUID"
	if len(cookie) < 14 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
		return
	}
	uidStr := cookie[14:]
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	var passengers []models.Passenger
	if err := db.GetDB().Where("user_id = ?", userID).Find(&passengers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch passengers"})
		return
	}

	// Map Enums back to Chinese for frontend display
	for i := range passengers {
		switch passengers[i].CardType {
		case "id_card":
			passengers[i].CardType = "居民身份证"
		case "passport":
			passengers[i].CardType = "护照"
		case "hkm_pass":
			passengers[i].CardType = "港澳居民来往内地通行证"
		case "tw_pass":
			passengers[i].CardType = "台湾居民来往大陆通行证"
		}

		switch passengers[i].PassengerType {
		case "adult":
			passengers[i].PassengerType = "成人"
		case "student":
			passengers[i].PassengerType = "学生"
		case "child":
			passengers[i].PassengerType = "儿童"
		}
	}

	c.JSON(http.StatusOK, passengers)
}

type AddPassengerRequest struct {
	Name     string `json:"name" binding:"required"`
	CardType string `json:"card_type" binding:"required"`
	CardNo   string `json:"card_no" binding:"required"`
	Type     string `json:"type" binding:"required"`
}

// API-POST-Passengers
func AddPassenger(c *gin.Context) {
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

	var req AddPassengerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Map CardType from Chinese to Enum
	switch req.CardType {
	case "居民身份证":
		req.CardType = "id_card"
	case "护照":
		req.CardType = "passport"
	case "港澳居民来往内地通行证":
		req.CardType = "hkm_pass"
	case "台湾居民来往大陆通行证":
		req.CardType = "tw_pass"
	}

	// Map PassengerType from Chinese to Enum
	switch req.Type {
	case "成人":
		req.Type = "adult"
	case "学生":
		req.Type = "student"
	case "儿童":
		req.Type = "child"
	}

	var count int64
	db.GetDB().Model(&models.Passenger{}).Where("user_id = ?", userID).Count(&count)
	if count >= 15 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Limit reached (15)"})
		return
	}

	// Check duplicate
	var exists int64
	db.GetDB().Model(&models.Passenger{}).Where("user_id = ? AND card_no = ?", userID, req.CardNo).Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Passenger already exists"})
		return
	}

	p := models.Passenger{
		UserID:        userID,
		Name:          req.Name,
		CardType:      req.CardType,
		CardNo:        req.CardNo,
		PassengerType: req.Type,
	}

	if err := db.GetDB().Create(&p).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create passenger"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": p.ID})
}
