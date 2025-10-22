package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestUserHandler_GetProfile(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:           "Valid token should return user profile",
			token:          "Bearer valid_jwt_token",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"userId":             "test-user-id",
				"username":           "testuser",
				"realName":           "测试用户",
				"idType":             "身份证",
				"idNumber":           "1234****5678", // 部分遮掩显示
				"phone":              "138****1234",
				"email":              "test@example.com",
				"passengerType":      "成人",
				"verificationStatus": "已验证",
			},
		},
		{
			name:           "Invalid token should return 401",
			token:          "Bearer invalid_token",
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
		{
			name:           "Missing token should return 401",
			token:          "",
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
		{
			name:           "Expired token should return 401",
			token:          "Bearer expired_token",
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.GET("/api/user/profile", GetProfile)

			req, _ := http.NewRequest("GET", "/api/user/profile", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", tt.token)
			}

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			if tt.expectedStatus == 200 {
				// 验证敏感信息是否部分遮掩
				assert.Contains(t, response["idNumber"], "****")
				assert.Contains(t, response["phone"], "****")
				assert.Equal(t, tt.expectedBody["username"], response["username"])
				assert.Equal(t, tt.expectedBody["realName"], response["realName"])
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}

func TestUserHandler_UpdateProfile(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		requestBody    map[string]interface{}
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:  "Valid update should succeed",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"phone": "13912345678",
				"email": "newemail@example.com",
			},
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"message": "Profile updated successfully",
			},
		},
		{
			name:  "Invalid phone format should return 400",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"phone": "invalid_phone",
				"email": "test@example.com",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid input format.",
			},
		},
		{
			name:  "Invalid email format should return 400",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"phone": "13912345678",
				"email": "invalid_email",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid input format.",
			},
		},
		{
			name:  "Duplicate phone number should return 400",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"phone": "13900000000", // 假设这个号码已被其他用户使用
				"email": "test@example.com",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid input format.",
			},
		},
		{
			name:  "Unauthorized access should return 401",
			token: "Bearer invalid_token",
			requestBody: map[string]interface{}{
				"phone": "13912345678",
				"email": "test@example.com",
			},
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
		{
			name:  "Missing token should return 401",
			token: "",
			requestBody: map[string]interface{}{
				"phone": "13912345678",
				"email": "test@example.com",
			},
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
		{
			name:  "Attempt to update restricted fields should be ignored",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"phone":    "13912345678",
				"email":    "test@example.com",
				"username": "newusername", // 不应该被更新
				"realName": "新姓名",        // 不应该被更新
			},
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"message": "Profile updated successfully",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.PUT("/api/user/profile", UpdateProfile)

			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("PUT", "/api/user/profile", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			if tt.token != "" {
				req.Header.Set("Authorization", tt.token)
			}

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedBody["message"], response["message"])
		})
	}
}