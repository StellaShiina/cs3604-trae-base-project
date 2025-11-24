package server

import (
    "net/http"
    "os"
    "crypto/rand"
    "encoding/hex"
    "fmt"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type Server struct {
    R  *gin.Engine
    DB *gorm.DB
    CodeGenerator func() string
    TokenGenerator func() string
}

func New(db *gorm.DB) *Server {
    r := gin.Default()
    origin := os.Getenv("DEV_FRONTEND_ORIGIN")
    if origin == "" {
        origin = "http://localhost:5173"
    }
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{origin},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))
    codeGen := func() string {
        var b [8]byte
        _, _ = rand.Read(b[:])
        n := (uint64(b[0])<<56 | uint64(b[1])<<48 | uint64(b[2])<<40 | uint64(b[3])<<32 | uint64(b[4])<<24 | uint64(b[5])<<16 | uint64(b[6])<<8 | uint64(b[7])) % 1000000
        return fmt.Sprintf("%06d", n)
    }
    tokenGen := func() string {
        bs := make([]byte, 16)
        _, _ = rand.Read(bs)
        return hex.EncodeToString(bs)
    }
    s := &Server{R: r, DB: db, CodeGenerator: codeGen, TokenGenerator: tokenGen}
    s.routes()
    return s
}

func (s *Server) routes() {
	v1 := s.R.Group("/api/v1")
	s.authRoutes(v1)
	v1.GET("/dictionaries", s.getDictionaries)
	v1.GET("/stations", s.searchStations)
	s.trainsRoutes(v1)
	s.preorderRoutes(v1)

    // daily job endpoint (optional manual trigger)
    s.R.POST("/internal/jobs/rolling14", func(c *gin.Context){
        s.DB.Exec("SELECT ensure_rolling_14_days()")
        c.JSON(http.StatusOK, gin.H{"ok": true})
    })
}

func (s *Server) getDictionaries(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"trainTypes":    []string{"G", "D", "C", "Z", "T", "K"},
		"seatTypes":     []string{"business", "first", "second", "softSleeper", "hardSleeper", "hardSeat"},
		"ticketTypes":   []string{"adult", "child", "student"},
		"dateRangeDays": 14,
	})
}

func (s *Server) searchStations(c *gin.Context) {
	q := c.Query("q")
	limit := 20
	var res []struct {
		ID     string
		Code   string
		NameEn string
		NameZh *string
		Pinyin *string
	}
	if q == "" {
		s.DB.Raw("SELECT id, code, name_en AS name_en, name_zh, pinyin FROM stations ORDER BY name_en LIMIT ?", limit).Scan(&res)
	} else {
		s.DB.Raw(`SELECT id, code, name_en AS name_en, name_zh, pinyin
                  FROM stations
                  WHERE lower(name_en) LIKE lower(?) OR lower(pinyin) LIKE lower(?)
                  ORDER BY name_en LIMIT ?`, "%"+q+"%", "%"+q+"%", limit).Scan(&res)
	}
	c.JSON(http.StatusOK, res)
}
