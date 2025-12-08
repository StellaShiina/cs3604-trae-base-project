package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type addressItem struct {
	ID        string  `json:"id"`
	Province  *string `json:"province"`
	City      *string `json:"city"`
	District  *string `json:"district"`
	Town      *string `json:"town"`
	Nearby    *string `json:"nearby"`
	Detail    string  `json:"detail"`
	Recipient string  `json:"recipient"`
	Mobile    string  `json:"mobile"`
	Default   bool    `json:"default"`
}

type addressCreateReq struct {
	Province  *string `json:"province"`
	City      *string `json:"city"`
	District  *string `json:"district"`
	Town      *string `json:"town"`
	Nearby    *string `json:"nearby"`
	Detail    string  `json:"detail"`
	Recipient string  `json:"recipient"`
	Mobile    string  `json:"mobile"`
	Default   bool    `json:"default"`
}

// ensureAddressSchema creates tables/indexes required for address APIs when missing.
func (s *Server) ensureAddressSchema() {
	s.DB.Exec(`CREATE TABLE IF NOT EXISTS user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        province TEXT,
        city TEXT,
        district TEXT,
        town TEXT,
        nearby TEXT,
        detail TEXT NOT NULL,
        recipient TEXT NOT NULL,
        mobile TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
	s.DB.Exec(`CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id)`)
	s.DB.Exec(`CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default)`)
}

func (s *Server) addressRoutes(g *gin.RouterGroup) {
	g.GET("/addresses", s.listAddresses)
	g.POST("/addresses", s.createAddress)
	g.PATCH("/addresses/:id/default", s.setDefaultAddress)
	g.DELETE("/addresses/:id", s.deleteAddress)
}

func (s *Server) currentUserID(c *gin.Context) (string, bool) {
	sid, err := c.Cookie("sid")
	if err != nil || sid == "" {
		return "", false
	}
	var sess struct{ UserID string }
	s.DB.Raw("SELECT user_id FROM sessions WHERE sid = ? AND (revoked_at IS NULL) AND expires_at > now() LIMIT 1", sid).Scan(&sess)
	if sess.UserID == "" {
		return "", false
	}
	return sess.UserID, true
}

func (s *Server) listAddresses(c *gin.Context) {
	uid, ok := s.currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "login required"})
		return
	}
	var items []addressItem
	s.DB.Raw(`SELECT id, province, city, district, town, nearby, detail, recipient, mobile, COALESCE(is_default,false) AS default
              FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC`, uid).Scan(&items)
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (s *Server) createAddress(c *gin.Context) {
	uid, ok := s.currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "login required"})
		return
	}
	// limit: up to 20 addresses per user
	var cnt int
	s.DB.Raw("SELECT COUNT(1) FROM user_addresses WHERE user_id = ?", uid).Scan(&cnt)
	if cnt >= 20 {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_parameters", "message": "address limit reached"})
		return
	}

	var req addressCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_parameters", "message": "bad request"})
		return
	}
	if req.Detail == "" || req.Recipient == "" || req.Mobile == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_parameters", "message": "missing fields"})
		return
	}
	var id string
	if err := s.DB.Raw(`INSERT INTO user_addresses(user_id, province, city, district, town, nearby, detail, recipient, mobile, is_default)
                        VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id`, uid, req.Province, req.City, req.District, req.Town, req.Nearby, req.Detail, req.Recipient, req.Mobile, req.Default).Scan(&id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": "server_error", "message": "insert failed"})
		return
	}
	if req.Default {
		s.DB.Exec("UPDATE user_addresses SET is_default = (id = ?) WHERE user_id = ?", id, uid)
	}
	c.JSON(http.StatusCreated, gin.H{"id": id})
}

func (s *Server) setDefaultAddress(c *gin.Context) {
	uid, ok := s.currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "login required"})
		return
	}
	id := c.Param("id")
	// ensure ownership
	var owned int
	s.DB.Raw("SELECT COUNT(1) FROM user_addresses WHERE id = ? AND user_id = ?", id, uid).Scan(&owned)
	if owned == 0 {
		c.JSON(http.StatusNotFound, gin.H{"code": "not_found", "message": "address not found"})
		return
	}
	s.DB.Exec("UPDATE user_addresses SET is_default = (id = ?) WHERE user_id = ?", id, uid)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (s *Server) deleteAddress(c *gin.Context) {
	uid, ok := s.currentUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "login required"})
		return
	}
	id := c.Param("id")
	s.DB.Exec("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", id, uid)
	c.JSON(http.StatusNoContent, gin.H{})
}
