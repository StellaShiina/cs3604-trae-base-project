package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"12306-backend/db"
	"12306-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

// Helper to setup router for tests
func setupTestRouter() *gin.Engine {
	db.InitTest()
	// Migrate schemas
	_ = db.GetDB().AutoMigrate(&models.User{}, &models.Passenger{}, &models.Train{}, &models.Order{}, &models.Ticket{}, &models.Station{}, &models.TrainService{}, &models.ServiceSegment{})
	
	// Seed data for Order creation test
	bjpID := uuid.New()
	shhID := uuid.New()
	if err := db.GetDB().Create(&models.Station{ID: bjpID, Code: "BJP", NameEn: "Beijing"}).Error; err != nil {
		panic("Failed to seed BJP: " + err.Error())
	}
	if err := db.GetDB().Create(&models.Station{ID: shhID, Code: "SHH", NameEn: "Shanghai"}).Error; err != nil {
		panic("Failed to seed SHH: " + err.Error())
	}

	// Seed TrainService for current date
	// In SQLite, date function returns YYYY-MM-DD. We need to match that.
	// However, Gorm writes time.Time as timestamp.
	// Let's try to use Exec with raw SQL to match the query expectation or rely on Gorm.
	// The query uses 'service_date = current_date'.
	db.GetDB().Exec("INSERT INTO train_services (train_no, service_date) VALUES ('G101', date('now'))")
	
	// Get the inserted ID
	var tsID int64
	db.GetDB().Raw("SELECT id FROM train_services WHERE train_no = 'G101'").Scan(&tsID)

	db.GetDB().Create(&models.ServiceSegment{
		TrainServiceID: tsID,
		FromStationID:  bjpID,
		ToStationID:    shhID,
	})

	// Create mock view/table for search
	db.GetDB().Exec(`CREATE TABLE IF NOT EXISTS v_train_search (
		train_no TEXT,
		start_time TEXT,
		end_time TEXT,
		second_class_left INTEGER,
		first_class_left INTEGER,
		from_station_id TEXT,
		to_station_id TEXT,
		date TEXT
	)`)
	
	// Seed data for search
	db.GetDB().Exec(`INSERT INTO v_train_search VALUES 
	('G1', '08:00', '12:00', 100, 50, 'uuid1', 'uuid2', '2025-11-28')`)

	gin.SetMode(gin.TestMode)
	return SetupRouter()
}

func TestRegister(t *testing.T) {
	// Ensure each test runs with a fresh DB
	r := setupTestRouter()

	t.Run("Success", func(t *testing.T) {
		payload := map[string]string{
			"username": "testuser",
			"password": "password123",
			"email":    "test@example.com",
			"mobile":   "13800000000",
			"name":     "Test User",
			"id_type":  "id_card",
			"id_no":    "110101199001011234",
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		// Acceptance Criteria: Return 201 and userId
		if w.Code != http.StatusCreated {
			t.Logf("Expected 201, got %d. Body: %s", w.Code, w.Body.String())
			// assert.Equal(t, http.StatusCreated, w.Code) // Let it fail naturally or log
		}
		
		// Since implementation is TODO, this will likely fail or return 200 OK empty
		// We assert strictly based on requirements
		assert.Equal(t, http.StatusCreated, w.Code)
		
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		assert.Contains(t, response, "userId")
	})

	t.Run("DuplicateUser", func(t *testing.T) {
		// Mock duplicate user scenario - Hard to test without DB mock injection
		// For now, we just define the test case structure
	})
}

func TestLogin(t *testing.T) {
	r := setupTestRouter()

	// Pre-register user
	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	email := "test@example.com"
	mobile := "13800000000"
	user := models.User{
		Username:     "testuser",
		PasswordHash: string(hash),
		Email:        &email,
		Mobile:       &mobile,
	}
	db.GetDB().Create(&user)

	t.Run("Success", func(t *testing.T) {
		payload := map[string]string{
			"identifier": "testuser",
			"password":   "password123",
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		// Check for sid cookie?
		// assert.NotEmpty(t, w.Result().Cookies()) 
	})
}
