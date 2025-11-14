package server

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

type preorderReq struct {
    TrainNo        string `json:"trainNo"`
    Date           string `json:"date"`
    FromStationId  string `json:"fromStationId"`
    ToStationId    string `json:"toStationId"`
    SeatType       string `json:"seatType"`
}

func (s *Server) preorderRoutes(g *gin.RouterGroup) {
    g.POST("/preorders", s.createPreorder)
}

func (s *Server) createPreorder(c *gin.Context) {
    sid, err := c.Cookie("sid")
    if err != nil || sid == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"login required"})
        return
    }
    var sess struct{ UserID string }
    s.DB.Raw("SELECT user_id FROM sessions WHERE sid = ? AND (revoked_at IS NULL) AND expires_at > now()", sid).Scan(&sess)
    if sess.UserID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"invalid session"})
        return
    }

    var req preorderReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"bad request"})
        return
    }

    var svcID int64
    s.DB.Raw("SELECT id FROM train_services WHERE train_no = ? AND service_date = ? LIMIT 1", req.TrainNo, req.Date).Scan(&svcID)
    if svcID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"code":"not_found","message":"train service not found"})
        return
    }
    var segID int64
    s.DB.Raw("SELECT id FROM service_segments WHERE train_service_id = ? AND from_station_id = ? AND to_station_id = ? LIMIT 1", svcID, req.FromStationId, req.ToStationId).Scan(&segID)
    if segID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"code":"not_found","message":"segment not found"})
        return
    }

    var preorderID string
    expires := time.Now().Add(15 * time.Minute)
    // hold one seat; trigger handles inventory
    if err := s.DB.Raw(`INSERT INTO preorders(user_id,train_service_id,from_station_id,to_station_id,segment_id,seat_type,hold_quantity,expires_at)
                        VALUES (?,?,?,?,?,?,1,?) RETURNING id`, sess.UserID, svcID, req.FromStationId, req.ToStationId, segID, req.SeatType, expires).Scan(&preorderID).Error; err != nil {
        c.JSON(http.StatusConflict, gin.H{"code":"conflict","message":"not enough seats"})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"preorderId": preorderID, "expiresAt": expires})
}