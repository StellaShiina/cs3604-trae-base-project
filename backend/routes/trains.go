package routes

import (
    "12306-backend/db"
    "encoding/json"
    "net/http"

    "github.com/gin-gonic/gin"
)

type TrainSearchResult struct {
	TrainNo   string `json:"trainNo"`
	From      string `json:"from"`
	To        string `json:"to"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Seats     []struct {
		Type     string `json:"type"`
		Left     int    `json:"left"`
		Bookable bool   `json:"bookable"`
	} `json:"seats"`
}

// API-GET-TrainSearch
func SearchTrains(c *gin.Context) {
	fromStation := c.Query("fromStationId")
	toStation := c.Query("toStationId")
	date := c.Query("date")

	if fromStation == "" || toStation == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required parameters"})
		return
	}

    var rows []struct {
        TrainNo    string
        DepartTime string
        ArriveTime string
        Seats      string
    }

    err := db.GetDB().Raw(`
        SELECT train_no, depart_time, arrive_time, seats 
        FROM v_train_search 
        WHERE from_station_id = ? AND to_station_id = ? AND date = ?
    `, fromStation, toStation, date).Scan(&rows).Error

    if err != nil {
        c.JSON(http.StatusOK, []TrainSearchResult{})
        return
    }

    var response []TrainSearchResult
    for _, r := range rows {
        var seatItems []struct {
            Type     string `json:"type"`
            Left     int    `json:"left"`
            Bookable bool   `json:"bookable"`
        }
        _ = json.Unmarshal([]byte(r.Seats), &seatItems)

        response = append(response, TrainSearchResult{
            TrainNo:   r.TrainNo,
            From:      fromStation,
            To:        toStation,
            StartTime: r.DepartTime,
            EndTime:   r.ArriveTime,
            Seats:     seatItems,
        })
    }

    c.JSON(http.StatusOK, response)
}
