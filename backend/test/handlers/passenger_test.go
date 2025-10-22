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

func TestPassengerHandler_GetPassengers(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		queryParams    string
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:           "Valid token should return passenger list",
			token:          "Bearer valid_jwt_token",
			queryParams:    "",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"passengers": []map[string]interface{}{
					{
						"id":                 "passenger-1",
						"name":               "张三",
						"idType":             "身份证",
						"idNumber":           "1234****5678",
						"phone":              "138****1234",
						"verificationStatus": "已验证",
					},
					{
						"id":                 "passenger-2",
						"name":               "李四",
						"idType":             "身份证",
						"idNumber":           "9876****4321",
						"phone":              "139****5678",
						"verificationStatus": "待验证",
					},
				},
			},
		},
		{
			name:           "Search by name should filter results",
			token:          "Bearer valid_jwt_token",
			queryParams:    "?search=张三",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"passengers": []map[string]interface{}{
					{
						"id":                 "passenger-1",
						"name":               "张三",
						"idType":             "身份证",
						"idNumber":           "1234****5678",
						"phone":              "138****1234",
						"verificationStatus": "已验证",
					},
				},
			},
		},
		{
			name:           "Search by ID number should filter results",
			token:          "Bearer valid_jwt_token",
			queryParams:    "?search=1234",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"passengers": []map[string]interface{}{
					{
						"id":                 "passenger-1",
						"name":               "张三",
						"idType":             "身份证",
						"idNumber":           "1234****5678",
						"phone":              "138****1234",
						"verificationStatus": "已验证",
					},
				},
			},
		},
		{
			name:           "Unauthorized access should return 401",
			token:          "Bearer invalid_token",
			queryParams:    "",
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.GET("/api/user/passengers", GetPassengers)

			req, _ := http.NewRequest("GET", "/api/user/passengers"+tt.queryParams, nil)
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
				passengers := response["passengers"].([]interface{})
				expectedPassengers := tt.expectedBody["passengers"].([]map[string]interface{})
				assert.Equal(t, len(expectedPassengers), len(passengers))
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}

func TestPassengerHandler_AddPassenger(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		requestBody    map[string]interface{}
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:  "Valid passenger data should create passenger",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"name":          "王五",
				"idType":        "身份证",
				"idNumber":      "123456789012345678",
				"phone":         "13912345678",
				"passengerType": "成人",
			},
			expectedStatus: 201,
			expectedBody: map[string]interface{}{
				"passengerId": "new-passenger-id",
				"message":     "Passenger added successfully",
			},
		},
		{
			name:  "Invalid ID number format should return 400",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"name":          "王五",
				"idType":        "身份证",
				"idNumber":      "invalid_id",
				"phone":         "13912345678",
				"passengerType": "成人",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid passenger information.",
			},
		},
		{
			name:  "Duplicate ID number should return 409",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"name":          "王五",
				"idType":        "身份证",
				"idNumber":      "123456789012345678", // 假设已存在
				"phone":         "13912345678",
				"passengerType": "成人",
			},
			expectedStatus: 409,
			expectedBody: map[string]interface{}{
				"error": "Passenger with this ID already exists.",
			},
		},
		{
			name:  "Missing required fields should return 400",
			token: "Bearer valid_jwt_token",
			requestBody: map[string]interface{}{
				"name":   "王五",
				"idType": "身份证",
				// 缺少 idNumber
				"phone":         "13912345678",
				"passengerType": "成人",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid passenger information.",
			},
		},
		{
			name:  "Unauthorized access should return 401",
			token: "Bearer invalid_token",
			requestBody: map[string]interface{}{
				"name":          "王五",
				"idType":        "身份证",
				"idNumber":      "123456789012345678",
				"phone":         "13912345678",
				"passengerType": "成人",
			},
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.POST("/api/user/passengers", AddPassenger)

			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/api/user/passengers", bytes.NewBuffer(jsonBody))
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

			if tt.expectedStatus == 201 {
				assert.Equal(t, tt.expectedBody["message"], response["message"])
				assert.NotEmpty(t, response["passengerId"])
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}

func TestPassengerHandler_UpdatePassenger(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		passengerId    string
		requestBody    map[string]interface{}
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:        "Valid update should succeed",
			token:       "Bearer valid_jwt_token",
			passengerId: "passenger-1",
			requestBody: map[string]interface{}{
				"name":          "张三三",
				"idType":        "身份证",
				"idNumber":      "123456789012345679",
				"phone":         "13912345679",
				"passengerType": "成人",
			},
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"message": "Passenger updated successfully",
			},
		},
		{
			name:        "Update non-existent passenger should return 404",
			token:       "Bearer valid_jwt_token",
			passengerId: "non-existent-id",
			requestBody: map[string]interface{}{
				"name":          "张三三",
				"idType":        "身份证",
				"idNumber":      "123456789012345679",
				"phone":         "13912345679",
				"passengerType": "成人",
			},
			expectedStatus: 404,
			expectedBody: map[string]interface{}{
				"error": "Passenger not found.",
			},
		},
		{
			name:        "Update passenger not owned by user should return 404",
			token:       "Bearer valid_jwt_token",
			passengerId: "other-user-passenger",
			requestBody: map[string]interface{}{
				"name":          "张三三",
				"idType":        "身份证",
				"idNumber":      "123456789012345679",
				"phone":         "13912345679",
				"passengerType": "成人",
			},
			expectedStatus: 404,
			expectedBody: map[string]interface{}{
				"error": "Passenger not found.",
			},
		},
		{
			name:        "Invalid passenger data should return 400",
			token:       "Bearer valid_jwt_token",
			passengerId: "passenger-1",
			requestBody: map[string]interface{}{
				"name":          "张三三",
				"idType":        "身份证",
				"idNumber":      "invalid_id",
				"phone":         "13912345679",
				"passengerType": "成人",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid passenger information.",
			},
		},
		{
			name:        "Unauthorized access should return 401",
			token:       "Bearer invalid_token",
			passengerId: "passenger-1",
			requestBody: map[string]interface{}{
				"name":          "张三三",
				"idType":        "身份证",
				"idNumber":      "123456789012345679",
				"phone":         "13912345679",
				"passengerType": "成人",
			},
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.PUT("/api/user/passengers/:id", UpdatePassenger)

			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("PUT", "/api/user/passengers/"+tt.passengerId, bytes.NewBuffer(jsonBody))
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

			if tt.expectedStatus == 200 {
				assert.Equal(t, tt.expectedBody["message"], response["message"])
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}

func TestPassengerHandler_DeletePassenger(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		passengerId    string
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:           "Valid deletion should succeed",
			token:          "Bearer valid_jwt_token",
			passengerId:    "passenger-1",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"message": "Passenger deleted successfully",
			},
		},
		{
			name:           "Delete non-existent passenger should return 404",
			token:          "Bearer valid_jwt_token",
			passengerId:    "non-existent-id",
			expectedStatus: 404,
			expectedBody: map[string]interface{}{
				"error": "Passenger not found.",
			},
		},
		{
			name:           "Delete passenger not owned by user should return 404",
			token:          "Bearer valid_jwt_token",
			passengerId:    "other-user-passenger",
			expectedStatus: 404,
			expectedBody: map[string]interface{}{
				"error": "Passenger not found.",
			},
		},
		{
			name:           "Delete passenger with active orders should return 409",
			token:          "Bearer valid_jwt_token",
			passengerId:    "passenger-with-orders",
			expectedStatus: 409,
			expectedBody: map[string]interface{}{
				"error": "Cannot delete passenger with active orders.",
			},
		},
		{
			name:           "Unauthorized access should return 401",
			token:          "Bearer invalid_token",
			passengerId:    "passenger-1",
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.DELETE("/api/user/passengers/:id", DeletePassenger)

			req, _ := http.NewRequest("DELETE", "/api/user/passengers/"+tt.passengerId, nil)
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
				assert.Equal(t, tt.expectedBody["message"], response["message"])
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}