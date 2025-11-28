package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"net/http"

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
		Email:        req.Email,
		Mobile:       req.Mobile,
		PasswordHash: string(hash),
		Name:         req.Name,
		// In a real app, IDType/IDNo might go to a separate profile or User struct
		// For now, assuming User struct has these or we ignore if not present in model
	}

	if result := db.GetDB().Create(&user); result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
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
