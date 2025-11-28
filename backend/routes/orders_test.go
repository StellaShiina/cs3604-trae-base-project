package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"12306-backend/db"
	"12306-backend/models"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCreateOrder(t *testing.T) {
	r := setupTestRouter()

	// Create mock user for session
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().Create(&models.User{
		ID:           userID,
		Username:     "testuser",
		PasswordHash: "hash",
	})

	t.Run("Success", func(t *testing.T) {
		payload := map[string]interface{}{
			"trainNo":  "G101",
			"seatType": "second",
			"passengers": []map[string]string{
				{"id": "uuid1", "name": "P1", "card_no": "123"},
			},
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/orders", bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Expect 201 Created and Order ID
		assert.Equal(t, http.StatusCreated, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Contains(t, response, "orderId")
	})

	t.Run("NotEnoughSeats", func(t *testing.T) {
		// Mock inventory 0
		// Expect 409 Conflict
	})
}
