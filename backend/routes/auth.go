package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email"`
	Mobile   string `json:"mobile"`
	Name     string `json:"name"`
	IDType   string `json:"id_type"`
	IDNo     string `json:"id_no"`
}

// API-POST-Register
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

    user := models.User{
        Username:     req.Username,
        Email:        func() *string { if req.Email == "" { return nil }; v := req.Email; return &v }(),
        Mobile:       func() *string { if req.Mobile == "" { return nil }; v := req.Mobile; return &v }(),
        PasswordHash: string(hash),
        Name:         req.Name,
        IDType:       req.IDType,
        IDNo:         req.IDNo,
    }

	if result := db.GetDB().Create(&user); result.Error != nil {
		// Check for duplicate key error
		// Postgres error 23505 is unique_violation
		// We can check error message string for now
		errStr := result.Error.Error()
		if strings.Contains(errStr, "duplicate key") || strings.Contains(errStr, "UNIQUE constraint failed") {
			c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		} else {
			// Log the actual error for debugging
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + errStr})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"userId": user.ID})
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

// API-POST-Login
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	// Check username, email, or mobile
	if err := db.GetDB().Where("username = ? OR email = ? OR mobile = ?", req.Identifier, req.Identifier, req.Identifier).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Set session cookie
	// In production, use a secure session store (Redis/DB)
	c.SetCookie("sid", "dummy-session-"+user.ID.String(), 3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"user": user})
}
