package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var (
	smsCodes = make(map[string]string)
	smsMutex sync.Mutex
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email"`
	Mobile   string `json:"mobile"`
	Name     string `json:"name"`
	IDType   string `json:"id_type"`
	IDNo     string `json:"id_no"`
	Gender   string `json:"gender"`
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

	// Default gender to "male" if not provided, or handle it.
	// For PostgreSQL enum 'gender_enum', valid values are 'male', 'female'.
	// If empty string is passed, it fails.
	gender := req.Gender
	if gender == "" {
		// We can default or make it null if pointer. Since User struct uses string,
		// we should probably default to a valid value or leave it to DB default if we omit it?
		// But struct will send "". Let's default to "male" for now as a quick fix,
		// or "unknown" if enum supported it. The DB only supports 'male','female'.
		// Ideally, frontend should send it.
		gender = "male"
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

type SendSMSRequest struct {
	Mobile string `json:"mobile" binding:"required"`
}

// API-POST-SendSMS
func SendSMS(c *gin.Context) {
	var req SendSMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate 6-digit code
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := fmt.Sprintf("%06d", rnd.Intn(1000000))

	// Store in map
	smsMutex.Lock()
	smsCodes[req.Mobile] = code
	smsMutex.Unlock()

	// Simulate sending (Print to console)
	fmt.Printf("[SMS SERVICE] Sending code %s to mobile %s\n", code, req.Mobile)

	// For testing convenience, return the code in the response
	c.JSON(http.StatusOK, gin.H{
		"message": "SMS sent successfully",
		"code":    code, // TODO: Remove this in production
	})
}

type VerifySMSRequest struct {
	Mobile string `json:"mobile" binding:"required"`
	Code   string `json:"code" binding:"required"`
}

// API-POST-VerifySMS
func VerifySMS(c *gin.Context) {
	var req VerifySMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	smsMutex.Lock()
	expectedCode, exists := smsCodes[req.Mobile]
	smsMutex.Unlock()

	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No verification code found for this mobile"})
		return
	}

	if expectedCode != req.Code {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification code"})
		return
	}

	// Optional: Clear code after use?
	// smsMutex.Lock()
	// delete(smsCodes, req.Mobile)
	// smsMutex.Unlock()

	c.JSON(http.StatusOK, gin.H{"message": "Verification successful"})
}
