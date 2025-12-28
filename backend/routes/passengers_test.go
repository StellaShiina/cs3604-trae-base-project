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

	t.Run("Success_ChineseInput", func(t *testing.T) {
		payload := map[string]string{
			"name":      "张三",
			"card_type": "居民身份证",
			"card_no":   "110101200001015678",
			"type":      "成人",
			"phone":     "13800000009", // Test phone mapping
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/passengers", bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		
		// Verify DB mapping
		var p models.Passenger
		db.GetDB().First(&p, "card_no = ?", "110101200001015678")
		assert.Equal(t, "id_card", p.CardType)
		assert.Equal(t, "adult", p.PassengerType)
		assert.Equal(t, "13800000009", p.Mobile)
	})

	t.Run("LimitReached", func(t *testing.T) {
		// Expect 400
	})

	t.Run("Validation_InvalidID", func(t *testing.T) {
		payload := map[string]string{
			"name":      "Invalid ID",
			"card_type": "id_card",
			"card_no":   "123", // Too short
			"type":      "adult",
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/passengers", bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "身份证号格式不正确", response["error"])
	})

	t.Run("Validation_InvalidMobile", func(t *testing.T) {
		payload := map[string]string{
			"name":      "Invalid Mobile",
			"card_type": "id_card",
			"card_no":   "110101200001011234",
			"type":      "adult",
			"mobile":    "123", // Invalid
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/passengers", bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Equal(t, "手机号格式不正确", response["error"])
	})
}

func TestDeletePassenger(t *testing.T) {
	r := setupTestRouter()

	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().FirstOrCreate(&models.User{ID: userID, Username: "testuser_del", PasswordHash: "hash"})

	p := models.Passenger{
		UserID:        userID,
		Name:          "To Delete",
		CardType:      "id_card",
		CardNo:        "110101200001019999",
		PassengerType: "adult",
	}
	db.GetDB().Create(&p)

	defaultP := models.Passenger{
		UserID:        userID,
		Name:          "Default",
		CardType:      "id_card",
		CardNo:        "110101200001018888",
		PassengerType: "adult",
		IsDefault:     true,
	}
	db.GetDB().Create(&defaultP)

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/v1/passengers/"+p.ID.String(), nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		// Verify deleted
		var count int64
		db.GetDB().Model(&models.Passenger{}).Where("id = ?", p.ID).Count(&count)
		assert.Equal(t, int64(0), count)
	})

	t.Run("Forbidden_DefaultPassenger", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/v1/passengers/"+defaultP.ID.String(), nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusForbidden, w.Code)
		var count int64
		db.GetDB().Model(&models.Passenger{}).Where("id = ?", defaultP.ID).Count(&count)
		assert.Equal(t, int64(1), count)
	})

	t.Run("NotFound", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/api/v1/passengers/"+uuid.New().String(), nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestEditPassenger(t *testing.T) {
	r := setupTestRouter()

	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().FirstOrCreate(&models.User{ID: userID, Username: "testuser_edit", PasswordHash: "hash"})

	p := models.Passenger{
		UserID:        userID,
		Name:          "Original Name",
		CardType:      "id_card",
		CardNo:        "110101200001010000",
		PassengerType: "adult",
	}
	db.GetDB().Create(&p)

	defaultP := models.Passenger{
		UserID:        userID,
		Name:          "Default",
		CardType:      "id_card",
		CardNo:        "110101200001018888",
		PassengerType: "adult",
		IsDefault:     true,
	}
	db.GetDB().Create(&defaultP)

	t.Run("Success", func(t *testing.T) {
		payload := map[string]string{
			"name":      "Updated Name",
			"card_type": "居民身份证",
			"card_no":   "110101200001010000",
			"type":      "学生",
			"phone":     "13800000000", // Use phone instead of mobile
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("PUT", "/api/v1/passengers/"+p.ID.String(), bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		// Verify DB
		var updatedP models.Passenger
		db.GetDB().First(&updatedP, p.ID)
		assert.Equal(t, "Updated Name", updatedP.Name)
		assert.Equal(t, "student", updatedP.PassengerType)
		assert.Equal(t, "13800000000", updatedP.Mobile)
	})

	t.Run("Forbidden_DefaultPassenger", func(t *testing.T) {
		payload := map[string]string{
			"name":      "Should Not Update",
			"card_type": "居民身份证",
			"card_no":   "110101200001018888",
			"type":      "学生",
			"phone":     "13800000000",
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("PUT", "/api/v1/passengers/"+defaultP.ID.String(), bytes.NewBuffer(body))
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusForbidden, w.Code)

		var unchanged models.Passenger
		db.GetDB().First(&unchanged, defaultP.ID)
		assert.Equal(t, "Default", unchanged.Name)
		assert.Equal(t, "adult", unchanged.PassengerType)
	})
}

func TestGetPassengers(t *testing.T) {
	r := setupTestRouter()
	
	// Create mock user
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	db.GetDB().Create(&models.User{
		ID:           userID,
		Username:     "testuser_get",
		PasswordHash: "hash",
	})

	// Add a passenger with Enum values
	db.GetDB().Create(&models.Passenger{
		UserID:        userID,
		Name:          "Test Passenger",
		CardType:      "id_card",
		CardNo:        "1234567890",
		PassengerType: "adult",
	})
	db.GetDB().Create(&models.Passenger{
		UserID:        userID,
		Name:          "Alice",
		CardType:      "passport",
		CardNo:        "P1234567",
		PassengerType: "student",
	})

	t.Run("Success_MapBackToChinese", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/passengers", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})
		
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var passengers []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &passengers)
		
		assert.Equal(t, 2, len(passengers))
		p := passengers[0]
		
		// Since models.Passenger has JSON tags now
		assert.Contains(t, []interface{}{"居民身份证", "护照"}, p["card_type"])
		assert.Contains(t, []interface{}{"成人", "学生"}, p["passenger_type"])
	})

	t.Run("FilterByName", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/passengers?name=Test", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var passengers []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &passengers)
		assert.Equal(t, 1, len(passengers))
		assert.Equal(t, "Test Passenger", passengers[0]["name"])
	})

	t.Run("FilterByName_NoMatch", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/passengers?name=NotExist", nil)
		req.AddCookie(&http.Cookie{Name: "sid", Value: "dummy-session-00000000-0000-0000-0000-000000000000"})

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var passengers []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &passengers)
		assert.Equal(t, 0, len(passengers))
	})
}
