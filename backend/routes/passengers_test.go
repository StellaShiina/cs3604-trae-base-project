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

func TestAddPassenger(t *testing.T) {
	r := setupTestRouter()

	// Create mock user for session
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().Create(&models.User{
		ID:           userID,
		Username:     "testuser",
		PasswordHash: "hash",
	})

	t.Run("Success", func(t *testing.T) {
		payload := map[string]string{
			"name":      "Passenger 1",
			"card_type": "id_card",
			"card_no":   "110101200001011234",
			"type":      "adult",
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/passengers", bytes.NewBuffer(body))
		// Mock Auth Cookie
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Contains(t, response, "id")
	})

	t.Run("LimitReached", func(t *testing.T) {
		// Expect 400
	})
}
