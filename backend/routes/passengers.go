package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"
	"strings"

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

func authenticateUser(c *gin.Context) (uuid.UUID, error) {
	var userID uuid.UUID
	var err error

	// 1. Try Cookie "sid"
	cookie, errCookie := c.Cookie("sid")
	if errCookie == nil && len(cookie) > 14 {
		// Cookie format "dummy-session-UUID"
		uidStr := cookie[14:]
		userID, err = uuid.Parse(uidStr)
	}

	// 2. If Cookie failed, try Authorization Header
	if userID == uuid.Nil {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			token := authHeader[7:]
			// Token format "dummy-token-UUID"
			if len(token) > 12 && strings.HasPrefix(token, "dummy-token-") {
				uidStr := token[12:]
				userID, err = uuid.Parse(uidStr)
			}
		}
	}
	return userID, err
}

// API-GET-Passengers
func GetPassengers(c *gin.Context) {
	userID, err := authenticateUser(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
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
	userID, err := authenticateUser(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Passenger with this ID already exists"})
		return
	}

	newPassenger := models.Passenger{
		UserID:        userID,
		Name:          req.Name,
		PassengerType: mapPassengerType(req.Type),
		CardType:      mapCardType(req.CardType),
		CardNo:        req.CardNo,
	}

	if err := db.GetDB().Create(&newPassenger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add passenger"})
		return
	}

	c.JSON(http.StatusCreated, newPassenger)
}

// API-PUT-Passengers
func UpdatePassenger(c *gin.Context) {
	userID, err := authenticateUser(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	id := c.Param("id")
	var req AddPassengerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var passenger models.Passenger
	if err := db.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&passenger).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Passenger not found"})
		return
	}

	passenger.Name = req.Name
	passenger.PassengerType = mapPassengerType(req.Type)
	passenger.CardType = mapCardType(req.CardType)
	passenger.CardNo = req.CardNo

	if err := db.GetDB().Save(&passenger).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update passenger"})
		return
	}

	c.JSON(http.StatusOK, passenger)
}

// API-DELETE-Passengers
func DeletePassenger(c *gin.Context) {
	userID, err := authenticateUser(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	id := c.Param("id")

	if err := db.GetDB().Where("id = ? AND user_id = ?", id, userID).Delete(&models.Passenger{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete passenger"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func mapCardType(ct string) string {
	switch ct {
	case "居民身份证":
		return "id_card"
	case "护照":
		return "passport"
	case "港澳居民来往内地通行证":
		return "other"
	case "台湾居民来往大陆通行证":
		return "other"
	default:
		// If already in enum format or unknown, return as is or fallback
		// Assuming input is Chinese from frontend
		if ct == "id_card" || ct == "passport" || ct == "other" {
			return ct
		}
		return "other"
	}
}

func mapPassengerType(pt string) string {
	switch pt {
	case "成人":
		return "adult"
	case "儿童":
		return "child"
	case "学生":
		return "student"
	case "残军":
		return "adult" // Enum only supports adult, child, student
	default:
		if pt == "adult" || pt == "child" || pt == "student" {
			return pt
		}
		return "adult"
	}
}
