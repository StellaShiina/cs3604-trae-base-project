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

func TestOrderHandler_GetOrders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		queryParams    string
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:           "Valid token should return order list ordered by creation time desc",
			token:          "Bearer valid_jwt_token",
			queryParams:    "",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"orders": []map[string]interface{}{
					{
						"orderId":       "order-2",
						"orderDate":     "2025-01-20T10:00:00Z",
						"trainNumber":   "G123",
						"departure":     "北京南",
						"arrival":       "上海虹桥",
						"departureTime": "2025-01-21T08:00:00Z",
						"arrivalTime":   "2025-01-21T13:30:00Z",
						"passengerName": "张三",
						"seatInfo":      "2车06A",
						"price":         "553.50",
						"status":        "待支付",
					},
					{
						"orderId":       "order-1",
						"orderDate":     "2025-01-19T15:30:00Z",
						"trainNumber":   "D456",
						"departure":     "上海虹桥",
						"arrival":       "杭州东",
						"departureTime": "2025-01-20T14:00:00Z",
						"arrivalTime":   "2025-01-20T15:30:00Z",
						"passengerName": "李四",
						"seatInfo":      "1车03B",
						"price":         "73.50",
						"status":        "已支付",
					},
				},
			},
		},
		{
			name:           "Filter by status should return filtered results",
			token:          "Bearer valid_jwt_token",
			queryParams:    "?status=待支付",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"orders": []map[string]interface{}{
					{
						"orderId":       "order-2",
						"orderDate":     "2025-01-20T10:00:00Z",
						"trainNumber":   "G123",
						"departure":     "北京南",
						"arrival":       "上海虹桥",
						"departureTime": "2025-01-21T08:00:00Z",
						"arrivalTime":   "2025-01-21T13:30:00Z",
						"passengerName": "张三",
						"seatInfo":      "2车06A",
						"price":         "553.50",
						"status":        "待支付",
					},
				},
			},
		},
		{
			name:           "Filter by type should return filtered results",
			token:          "Bearer valid_jwt_token",
			queryParams:    "?type=未出行",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"orders": []map[string]interface{}{
					{
						"orderId":       "order-2",
						"orderDate":     "2025-01-20T10:00:00Z",
						"trainNumber":   "G123",
						"departure":     "北京南",
						"arrival":       "上海虹桥",
						"departureTime": "2025-01-21T08:00:00Z",
						"arrivalTime":   "2025-01-21T13:30:00Z",
						"passengerName": "张三",
						"seatInfo":      "2车06A",
						"price":         "553.50",
						"status":        "待支付",
					},
				},
			},
		},
		{
			name:           "Combined filters should work",
			token:          "Bearer valid_jwt_token",
			queryParams:    "?status=已支付&type=历史订单",
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"orders": []map[string]interface{}{
					{
						"orderId":       "order-1",
						"orderDate":     "2025-01-19T15:30:00Z",
						"trainNumber":   "D456",
						"departure":     "上海虹桥",
						"arrival":       "杭州东",
						"departureTime": "2025-01-20T14:00:00Z",
						"arrivalTime":   "2025-01-20T15:30:00Z",
						"passengerName": "李四",
						"seatInfo":      "1车03B",
						"price":         "73.50",
						"status":        "已支付",
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
		{
			name:           "Missing token should return 401",
			token:          "",
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
			router.GET("/api/user/orders", GetOrders)

			req, _ := http.NewRequest("GET", "/api/user/orders"+tt.queryParams, nil)
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
				orders := response["orders"].([]interface{})
				expectedOrders := tt.expectedBody["orders"].([]map[string]interface{})
				assert.Equal(t, len(expectedOrders), len(orders))
				
				// 验证订单按创建时间倒序排列
				if len(orders) > 1 {
					firstOrder := orders[0].(map[string]interface{})
					secondOrder := orders[1].(map[string]interface{})
					assert.True(t, firstOrder["orderDate"].(string) >= secondOrder["orderDate"].(string))
				}
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}

func TestOrderHandler_ProcessPayment(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		token          string
		orderId        string
		requestBody    map[string]interface{}
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:    "Valid payment should succeed",
			token:   "Bearer valid_jwt_token",
			orderId: "pending-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 200,
			expectedBody: map[string]interface{}{
				"paymentId": "payment-123",
				"message":   "Payment processed successfully",
			},
		},
		{
			name:    "Invalid payment method should return 400",
			token:   "Bearer valid_jwt_token",
			orderId: "pending-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "invalid_method",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid payment information.",
			},
		},
		{
			name:    "Missing payment info should return 400",
			token:   "Bearer valid_jwt_token",
			orderId: "pending-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
			},
			expectedStatus: 400,
			expectedBody: map[string]interface{}{
				"error": "Invalid payment information.",
			},
		},
		{
			name:    "Non-existent order should return 404",
			token:   "Bearer valid_jwt_token",
			orderId: "non-existent-order",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 404,
			expectedBody: map[string]interface{}{
				"error": "Order not found.",
			},
		},
		{
			name:    "Order not owned by user should return 404",
			token:   "Bearer valid_jwt_token",
			orderId: "other-user-order",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 404,
			expectedBody: map[string]interface{}{
				"error": "Order not found.",
			},
		},
		{
			name:    "Already paid order should return 409",
			token:   "Bearer valid_jwt_token",
			orderId: "paid-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 409,
			expectedBody: map[string]interface{}{
				"error": "Order already paid or cancelled.",
			},
		},
		{
			name:    "Cancelled order should return 409",
			token:   "Bearer valid_jwt_token",
			orderId: "cancelled-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 409,
			expectedBody: map[string]interface{}{
				"error": "Order already paid or cancelled.",
			},
		},
		{
			name:    "Unauthorized access should return 401",
			token:   "Bearer invalid_token",
			orderId: "pending-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
			},
			expectedStatus: 401,
			expectedBody: map[string]interface{}{
				"error": "Unauthorized access.",
			},
		},
		{
			name:    "Missing token should return 401",
			token:   "",
			orderId: "pending-order-id",
			requestBody: map[string]interface{}{
				"paymentMethod": "alipay",
				"paymentInfo": map[string]interface{}{
					"account": "user@example.com",
				},
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
			router.POST("/api/orders/:orderId/payment", ProcessPayment)

			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/api/orders/"+tt.orderId+"/payment", bytes.NewBuffer(jsonBody))
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
				assert.NotEmpty(t, response["paymentId"])
			} else {
				assert.Equal(t, tt.expectedBody["error"], response["error"])
			}
		})
	}
}