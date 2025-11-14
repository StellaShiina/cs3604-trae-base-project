package server

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
    Identifier string `json:"identifier"`
    Password   string `json:"password"`
    RememberMe bool   `json:"rememberMe"`
}

type registerRequest struct {
    Nationality string  `json:"nationality"`
    Name        string  `json:"name"`
    PassportNumber string `json:"passportNumber"`
    PassportExpirationDate string `json:"passportExpirationDate"`
    DateOfBirth string `json:"dateOfBirth"`
    Gender      string  `json:"gender"`
    Username    string  `json:"username"`
    Password    string  `json:"password"`
    Email       string  `json:"email"`
    AgreeTerms  bool    `json:"agreeTerms"`
}

func (s *Server) authRoutes(g *gin.RouterGroup) {
    g.POST("/auth/login", s.login)
    g.POST("/auth/logout", s.logout)
    g.POST("/auth/register", s.register)
    g.GET("/session/me", s.sessionMe)
}

func (s *Server) login(c *gin.Context) {
    var req loginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"bad request"})
        return
    }
    // lookup by username/email/mobile
    var row struct{ ID string; Username string; Email *string; Mobile *string; PasswordHash string }
    s.DB.Raw("SELECT id, username, email, mobile, password_hash FROM users WHERE username = ? OR email = ? OR mobile = ? LIMIT 1",
        req.Identifier, req.Identifier, req.Identifier).Scan(&row)
    if row.ID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"Invalid credentials"})
        return
    }
    if bcrypt.CompareHashAndPassword([]byte(row.PasswordHash), []byte(req.Password)) != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"Invalid credentials"})
        return
    }
    // create session
    expires := time.Now().Add(7 * 24 * time.Hour)
    var sid string
    s.DB.Raw("INSERT INTO sessions(user_id, expires_at) VALUES (?, ?) RETURNING sid", row.ID, expires).Scan(&sid)
    c.SetCookie("sid", sid, int(expires.Sub(time.Now()).Seconds()), "/", "", false, true)
    c.JSON(http.StatusOK, gin.H{"user": gin.H{"id": row.ID, "username": row.Username, "email": row.Email, "mobile": row.Mobile}, "session": gin.H{"sid": sid, "expiresAt": expires}})
}

func (s *Server) logout(c *gin.Context) {
    sid, err := c.Cookie("sid")
    if err == nil && sid != "" {
        s.DB.Exec("UPDATE sessions SET revoked_at = now() WHERE sid = ?", sid)
    }
    c.JSON(http.StatusNoContent, gin.H{})
}

func (s *Server) sessionMe(c *gin.Context) {
    sid, err := c.Cookie("sid")
    if err != nil || sid == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"no session"})
        return
    }
    var row struct{ ID string; Username string; Email *string; Mobile *string }
    s.DB.Raw(`SELECT u.id, u.username, u.email, u.mobile
              FROM sessions s JOIN users u ON u.id = s.user_id
              WHERE s.sid = ? AND (s.revoked_at IS NULL) AND s.expires_at > now() LIMIT 1`, sid).Scan(&row)
    if row.ID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"invalid session"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"user": row})
}

func (s *Server) register(c *gin.Context) {
    var req registerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"bad request"})
        return
    }
    if !req.AgreeTerms || req.Username == "" || req.Password == "" || req.Email == "" {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"missing fields"})
        return
    }
    hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    // parse dates if provided
    var passportExp, dob *time.Time
    if req.PassportExpirationDate != "" {
        if t, err := time.Parse("2006-01-02", req.PassportExpirationDate); err == nil { passportExp = &t }
    }
    if req.DateOfBirth != "" {
        if t, err := time.Parse("2006-01-02", req.DateOfBirth); err == nil { dob = &t }
    }
    // insert
    var uid string
    err := s.DB.Raw(`INSERT INTO users(username,email,password_hash,name,nationality,passport_number,passport_expiration_date,date_of_birth,gender)
                     VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`,
        req.Username, req.Email, string(hash), req.Name, req.Nationality, req.PassportNumber, passportExp, dob, req.Gender).Scan(&uid).Error
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{"code":"conflict","message":"Already taken"})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"user": gin.H{"id": uid, "username": req.Username, "email": req.Email}, "next": "login"})
}