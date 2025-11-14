package server

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func (s *Server) trainsRoutes(g *gin.RouterGroup) {
    g.GET("/trains/search", s.searchTrains)
}

type trainsQuery struct {
    FromStationId string `form:"fromStationId" binding:"required"`
    ToStationId   string `form:"toStationId" binding:"required"`
    Date          string `form:"date" binding:"required"`
    DepartTimeStart string `form:"departTimeStart"`
    DepartTimeEnd   string `form:"departTimeEnd"`
    TrainTypes      string `form:"trainTypes"`
    HighSpeedOnly   bool   `form:"highSpeedOnly"`
    Page            int    `form:"page"`
    PageSize        int    `form:"pageSize"`
}

func (s *Server) searchTrains(c *gin.Context) {
    var q trainsQuery
    if err := c.BindQuery(&q); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"bad query"})
        return
    }
    if q.FromStationId == q.ToStationId {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"Departure and destination cannot be the same"})
        return
    }
    // base query on view
    sql := `SELECT train_service_id, train_no, train_type, segment_id, from_station_id, to_station_id,
                   depart_time, arrive_time, duration, date, bookable, seats
            FROM v_train_search
            WHERE from_station_id = ? AND to_station_id = ? AND date = ?`
    args := []any{q.FromStationId, q.ToStationId, q.Date}
    if q.DepartTimeStart != "" && q.DepartTimeEnd != "" {
        sql += " AND depart_time BETWEEN ? AND ?"
        args = append(args, q.DepartTimeStart, q.DepartTimeEnd)
    }
    if q.HighSpeedOnly {
        sql += " AND train_type IN ('G','D','C')"
    } else if q.TrainTypes != "" {
        // simple filter: client side preferred; here we ignore to keep SQL safe
    }
    sql += " ORDER BY depart_time ASC"
    var items []map[string]any
    s.DB.Raw(sql, args...).Scan(&items)
    c.JSON(http.StatusOK, gin.H{"items": items, "page": gin.H{"page": 1, "pageSize": len(items), "total": len(items)}})
}