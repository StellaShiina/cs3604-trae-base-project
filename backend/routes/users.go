package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// API-GET-UserInfo
func GetUserInfo(c *gin.Context) {
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

	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session user"})
		return
	}

	var user models.User
	if err := db.GetDB().First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Map to frontend expected format
	c.JSON(http.StatusOK, gin.H{
		"username":           user.Username,
		"name":               user.Name,
		"country":            "中国", // Default
		"idCardType":         user.IDType,
		"idCardNumber":       user.IDNo,
		"verificationStatus": "已通过", // Mocked for now
		"phone":              user.Mobile,
		"email":              user.Email,
		"discountType":       "无", // Mocked
		"gender":             user.Gender,
	})
}
