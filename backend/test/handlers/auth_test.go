package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"railway-booking/src/handlers"
)

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		expectedFields []string
		description    string
	}{
		{
			name: "Valid credentials should return 200 OK with JWT token",
			requestBody: map[string]interface{}{
				"username": "testuser",
				"password": "validpassword",
			},
			expectedStatus: http.StatusOK,
			expectedFields: []string{"userId", "token", "userInfo"},
			description:    "当接收到合法凭据时，应返回200 OK和JWT令牌",
		},
		{
			name: "Invalid credentials should return 401 Unauthorized",
			requestBody: map[string]interface{}{
				"username": "testuser",
				"password": "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
			expectedFields: []string{"error"},
			description:    "当凭据无效时，应返回401 Unauthorized",
		},
		{
			name: "Login with email should be supported",
			requestBody: map[string]interface{}{
				"username": "test@example.com",
				"password": "validpassword",
			},
			expectedStatus: http.StatusOK,
			expectedFields: []string{"userId", "token", "userInfo"},
			description:    "支持多种登录方式（用户名、手机号、邮箱）",
		},
		{
			name: "Login with phone number should be supported",
			requestBody: map[string]interface{}{
				"username": "13800138000",
				"password": "validpassword",
			},
			expectedStatus: http.StatusOK,
			expectedFields: []string{"userId", "token", "userInfo"},
			description:    "支持多种登录方式（用户名、手机号、邮箱）",
		},
		{
			name: "Invalid input format should return 400",
			requestBody: map[string]interface{}{
				"username": "",
				"password": "",
			},
			expectedStatus: http.StatusBadRequest,
			expectedFields: []string{"error"},
			description:    "Invalid input format should return 400 error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			
			// Create request body
			jsonBody, _ := json.Marshal(tt.requestBody)
			c.Request = httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
			c.Request.Header.Set("Content-Type", "application/json")
			
			// Create handler
			authHandler := handlers.NewAuthHandler()
			
			// Execute
			authHandler.Login(c)
			
			// Assert status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			
			// Parse response
			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			if err != nil {
				t.Fatalf("Failed to parse response: %v", err)
			}
			
			// Check expected fields exist in response
			for _, field := range tt.expectedFields {
				if _, exists := response[field]; !exists {
					t.Errorf("Expected field '%s' not found in response", field)
				}
			}
			
			// This test should FAIL because login functionality is not implemented yet
			// The handler currently returns StatusNotImplemented
			if w.Code == http.StatusNotImplemented {
				t.Logf("TEST EXPECTED TO FAIL: %s - Login functionality not implemented yet", tt.description)
			}
		})
	}
}

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		expectedFields []string
		description    string
	}{
		{
			name: "Valid registration data should return 201 Created",
			requestBody: map[string]interface{}{
				"username":        "newuser",
				"password":        "validpassword",
				"confirmPassword": "validpassword",
				"realName":        "张三",
				"idType":          "身份证",
				"idNumber":        "110101199001011234",
				"passengerType":   "成人",
				"phoneNumber":     "13800138000",
				"email":           "newuser@example.com",
				"agreeTerms":      true,
			},
			expectedStatus: http.StatusCreated,
			expectedFields: []string{"userId", "message"},
			description:    "当接收到合法且未注册的数据时，应返回201 Created",
		},
		{
			name: "Existing username should return 409 Conflict",
			requestBody: map[string]interface{}{
				"username":        "existinguser",
				"password":        "validpassword",
				"confirmPassword": "validpassword",
				"realName":        "李四",
				"idType":          "身份证",
				"idNumber":        "110101199001011235",
				"passengerType":   "成人",
				"phoneNumber":     "13800138001",
				"email":           "existing@example.com",
				"agreeTerms":      true,
			},
			expectedStatus: http.StatusConflict,
			expectedFields: []string{"error"},
			description:    "当用户名或手机号已存在时，应返回409 Conflict",
		},
		{
			name: "Password mismatch should return 400",
			requestBody: map[string]interface{}{
				"username":        "testuser",
				"password":        "password1",
				"confirmPassword": "password2",
				"realName":        "王五",
				"idType":          "身份证",
				"idNumber":        "110101199001011236",
				"passengerType":   "成人",
				"phoneNumber":     "13800138002",
				"email":           "test@example.com",
				"agreeTerms":      true,
			},
			expectedStatus: http.StatusBadRequest,
			expectedFields: []string{"error"},
			description:    "密码确认不一致时返回400错误",
		},
		{
			name: "Not agreeing to terms should return 400",
			requestBody: map[string]interface{}{
				"username":        "testuser2",
				"password":        "validpassword",
				"confirmPassword": "validpassword",
				"realName":        "赵六",
				"idType":          "身份证",
				"idNumber":        "110101199001011237",
				"passengerType":   "成人",
				"phoneNumber":     "13800138003",
				"email":           "test2@example.com",
				"agreeTerms":      false,
			},
			expectedStatus: http.StatusBadRequest,
			expectedFields: []string{"error"},
			description:    "必须同意服务条款才能注册",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			
			// Create request body
			jsonBody, _ := json.Marshal(tt.requestBody)
			c.Request = httptest.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(jsonBody))
			c.Request.Header.Set("Content-Type", "application/json")
			
			// Create handler
			authHandler := handlers.NewAuthHandler()
			
			// Execute
			authHandler.Register(c)
			
			// Assert status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			
			// This test should FAIL because register functionality is not implemented yet
			if w.Code == http.StatusNotImplemented {
				t.Logf("TEST EXPECTED TO FAIL: %s - Register functionality not implemented yet", tt.description)
			}
		})
	}
}

func TestAuthHandler_Logout(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
		description    string
	}{
		{
			name:           "Valid token should logout successfully",
			authHeader:     "Bearer valid.jwt.token",
			expectedStatus: http.StatusOK,
			description:    "成功登出后令牌应被加入黑名单",
		},
		{
			name:           "Invalid token should return 401",
			authHeader:     "Bearer invalid.token",
			expectedStatus: http.StatusUnauthorized,
			description:    "无效令牌应返回401错误",
		},
		{
			name:           "Missing token should return 401",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
			description:    "缺少令牌应返回401错误",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			
			c.Request = httptest.NewRequest("POST", "/api/auth/logout", nil)
			if tt.authHeader != "" {
				c.Request.Header.Set("Authorization", tt.authHeader)
			}
			
			// Create handler
			authHandler := handlers.NewAuthHandler()
			
			// Execute
			authHandler.Logout(c)
			
			// Assert status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			
			// This test should FAIL because logout functionality is not implemented yet
			if w.Code == http.StatusNotImplemented {
				t.Logf("TEST EXPECTED TO FAIL: %s - Logout functionality not implemented yet", tt.description)
			}
		})
	}
}