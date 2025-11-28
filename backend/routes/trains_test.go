package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSearchTrains(t *testing.T) {
	r := setupTestRouter()

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/trains/search?fromStationId=uuid1&toStationId=uuid2&date=2025-11-28", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		// TODO: Parse body and check structure
	})
}
