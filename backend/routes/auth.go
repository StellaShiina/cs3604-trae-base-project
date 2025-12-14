package routes

import (
	"12306-backend/db"
	"12306-backend/models"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var (
	smsCodes             = make(map[string]string)
	smsMutex             sync.Mutex
	pendingRegistrations = make(map[string]RegisterRequest)
	pendingMutex         sync.Mutex
	pendingLogins        = make(map[string]models.User)
	loginMutex           sync.Mutex
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
// Now only validates and temporarily stores data, returning a sessionId
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Basic Validation (Check duplicates before proceeding)
	var existingUser models.User
	if err := db.GetDB().Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "该用户名已经占用"})
		return
	}
	if err := db.GetDB().Where("id_no = ?", req.IDNo).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "该证件号已被注册"})
		return
	}

	// 2. Generate Session ID
	sessionID := fmt.Sprintf("%d", time.Now().UnixNano())

	// 3. Store in temporary map (In production, use Redis with expiration)
	pendingMutex.Lock()
	pendingRegistrations[sessionID] = req
	pendingMutex.Unlock()

	c.JSON(http.StatusCreated, gin.H{
		"message":   "注册信息已提交，请进行验证",
		"sessionId": sessionID,
	})
}

// API-POST-CompleteRegistration
// Verifies SMS code and creates the user
type CompleteRegistrationRequest struct {
	SessionID string `json:"sessionId" binding:"required"`
	SMSCode   string `json:"smsCode" binding:"required"`
}

func CompleteRegistration(c *gin.Context) {
	var req CompleteRegistrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Retrieve pending registration data
	pendingMutex.Lock()
	regData, exists := pendingRegistrations[req.SessionID]
	pendingMutex.Unlock()

	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "会话无效或已过期，请重新提交注册信息"})
		return
	}

	// 2. Verify SMS Code
	smsMutex.Lock()
	expectedCode, codeExists := smsCodes[regData.Mobile]
	smsMutex.Unlock()

	if !codeExists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请先获取验证码"})
		return
	}
	if expectedCode != req.SMSCode {
		c.JSON(http.StatusBadRequest, gin.H{"error": "验证码错误"})
		return
	}

	// 3. Create User in Database
	hash, err := bcrypt.GenerateFromPassword([]byte(regData.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Default gender handling
	gender := regData.Gender
	if gender == "" {
		gender = "male"
	}

	user := models.User{
		Username:     regData.Username,
		Email:        regData.Email,
		Mobile:       regData.Mobile,
		PasswordHash: string(hash),
		Name:         regData.Name,
		Gender:       gender,
		IDType:       regData.IDType,
		IDNo:         regData.IDNo,
	}

	if result := db.GetDB().Create(&user); result.Error != nil {
		errStr := result.Error.Error()
		if strings.Contains(errStr, "duplicate key") || strings.Contains(errStr, "UNIQUE constraint") {
			if strings.Contains(errStr, "username") {
				c.JSON(http.StatusConflict, gin.H{"error": "该用户名已经占用"})
				return
			}
			if strings.Contains(errStr, "id_no") || strings.Contains(errStr, "id_card_number") {
				c.JSON(http.StatusConflict, gin.H{"error": "该证件号已被注册"})
				return
			}
		}
		c.JSON(http.StatusConflict, gin.H{"error": errStr})
		return
	}

	// 4. Cleanup
	pendingMutex.Lock()
	delete(pendingRegistrations, req.SessionID)
	pendingMutex.Unlock()

	smsMutex.Lock()
	delete(smsCodes, regData.Mobile)
	smsMutex.Unlock()

	c.JSON(http.StatusCreated, gin.H{"userId": user.ID, "message": "注册成功"})
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

	// Generate Session ID for verification
	sessionID := fmt.Sprintf("%d", time.Now().UnixNano())

	// Store user in pending logins
	loginMutex.Lock()
	pendingLogins[sessionID] = user
	loginMutex.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"sessionId": sessionID,
		"message":   "请完成短信验证",
	})
}

// API-POST-SendSMS
// Now accepts optional sessionId to send to the phone number associated with the session if mobile not provided
type SendSMSRequest struct {
	Mobile    string `json:"mobile"`
	SessionID string `json:"sessionId"`
}

func SendSMS(c *gin.Context) {
	var req SendSMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mobile := req.Mobile

	// If sessionId is provided, try to find pending registration or login
	if req.SessionID != "" {
		pendingMutex.Lock()
		if data, ok := pendingRegistrations[req.SessionID]; ok {
			mobile = data.Mobile
		}
		pendingMutex.Unlock()

		if mobile == "" {
			loginMutex.Lock()
			if user, ok := pendingLogins[req.SessionID]; ok {
				mobile = user.Mobile
			}
			loginMutex.Unlock()
		}
	}

	if mobile == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mobile number is required"})
		return
	}

	// Generate 6-digit code
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := fmt.Sprintf("%06d", rnd.Intn(1000000))

	// Store in map
	smsMutex.Lock()
	smsCodes[mobile] = code
	smsMutex.Unlock()

	// Simulate sending (Print to console)
	fmt.Printf("[SMS SERVICE] Sending code %s to mobile %s\n", code, mobile)

	// For testing convenience, return the code in the response
	c.JSON(http.StatusOK, gin.H{
		"message":          "SMS sent successfully",
		"code":             code, // TODO: Remove this in production
		"verificationCode": code, // Alias for frontend compatibility
		"phone":            mobile,
	})
}

type VerifyLoginRequest struct {
	SessionID        string `json:"sessionId" binding:"required"`
	VerificationCode string `json:"verificationCode" binding:"required"`
	IDCardLast4      string `json:"idCardLast4"` // Optional verification
}

// API-POST-VerifyLogin
func VerifyLogin(c *gin.Context) {
	var req VerifyLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	loginMutex.Lock()
	user, exists := pendingLogins[req.SessionID]
	loginMutex.Unlock()

	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session expired or invalid"})
		return
	}

	// Verify ID Card Last 4 (if provided/required)
	if len(user.IDNo) >= 4 && req.IDCardLast4 != "" {
		last4 := user.IDNo[len(user.IDNo)-4:]
		if req.IDCardLast4 != last4 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "证件号后4位不匹配"})
			return
		}
	}

	// Verify SMS
	smsMutex.Lock()
	expectedCode, codeExists := smsCodes[user.Mobile]
	smsMutex.Unlock()

	if !codeExists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请先获取验证码"})
		return
	}

	if expectedCode != req.VerificationCode {
		c.JSON(http.StatusBadRequest, gin.H{"error": "验证码错误"})
		return
	}

	// Success - Cleanup
	loginMutex.Lock()
	delete(pendingLogins, req.SessionID)
	loginMutex.Unlock()

	smsMutex.Lock()
	delete(smsCodes, user.Mobile)
	smsMutex.Unlock()

	// Set session cookie
	c.SetCookie("sid", "dummy-session-"+user.ID.String(), 3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   "dummy-token-" + user.ID.String(),
		"user":    user,
	})
}

type VerifySMSRequest struct {
	Mobile    string `json:"mobile"`
	Code      string `json:"code" binding:"required"`
	SessionID string `json:"sessionId"`
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
