package server

import (
    "net/http"
    "time"
    "os"
    "log"
    "database/sql"
    "crypto/sha256"
    "encoding/hex"

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
    g.POST("/auth/forgot", s.forgot)
    g.POST("/auth/forgot/verify", s.forgotVerify)
    g.POST("/auth/forgot/reset", s.forgotReset)
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
    // validations
    if passportExp != nil {
        today := time.Now()
        if passportExp.Before(time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())) {
            c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"passport expired"})
            return
        }
        if dob != nil && dob.After(*passportExp) {
            c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"date of birth cannot be after passport expiration"})
            return
        }
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

type forgotRequest struct {
    Identifier string `json:"identifier"`
}

type verifyRequest struct {
    Identifier string `json:"identifier"`
    Code       string `json:"code"`
}

type resetRequest struct {
    ResetToken     string `json:"resetToken"`
    NewPassword    string `json:"newPassword"`
    ConfirmPassword string `json:"confirmPassword"`
}

func (s *Server) forgot(c *gin.Context) {
    var req forgotRequest
    if err := c.ShouldBindJSON(&req); err != nil || req.Identifier == "" {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"bad request"})
        return
    }
    var u struct{ ID string }
    s.DB.Raw("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", req.Identifier, req.Identifier).Scan(&u)
    if u.ID == "" {
        c.JSON(http.StatusNotFound, gin.H{"code":"not_found","message":"Username or email does not exist"})
        return
    }
    expires := time.Now().Add(10 * time.Minute)
    maxAttempts := 5
    code := s.CodeGenerator()
    hash, _ := bcrypt.GenerateFromPassword([]byte(code), bcrypt.DefaultCost)
    s.DB.Exec("INSERT INTO password_resets(user_id, code_hash, expires_at, attempts, max_attempts, created_at) VALUES (?,?,?,?,?,now())",
        u.ID, string(hash), expires, 0, maxAttempts)
    if os.Getenv("ENV") == "dev" {
        log.Printf("password reset code user=%s code=%s", u.ID, code)
    }
    c.JSON(http.StatusAccepted, gin.H{"status":"accepted","next":"verify"})
}

func (s *Server) forgotVerify(c *gin.Context) {
    var req verifyRequest
    if err := c.ShouldBindJSON(&req); err != nil || req.Identifier == "" || req.Code == "" {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"bad request"})
        return
    }
    var u struct{ ID string }
    s.DB.Raw("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", req.Identifier, req.Identifier).Scan(&u)
    if u.ID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_code","message":"Invalid or already used"})
        return
    }
    var row struct{
        ID string
        CodeHash string
        ExpiresAt time.Time
        Attempts int
        MaxAttempts int
        UsedAt sql.NullTime
        ResetTokenHash *string
        ResetTokenExpiresAt *time.Time
    }
    s.DB.Raw("SELECT id, code_hash, expires_at, attempts, max_attempts, used_at, reset_token_hash, reset_token_expires_at FROM password_resets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", u.ID).Scan(&row)
    if row.ID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_code","message":"Invalid or already used"})
        return
    }
    if row.Attempts >= row.MaxAttempts {
        c.JSON(http.StatusTooManyRequests, gin.H{"code":"too_many_attempts","message":"Please request a new code"})
        return
    }
    if time.Now().After(row.ExpiresAt) {
        c.JSON(http.StatusGone, gin.H{"code":"expired","message":"Code expired"})
        return
    }
    if row.UsedAt.Valid || (row.ResetTokenHash != nil && *row.ResetTokenHash != "") {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_code","message":"Invalid or already used"})
        return
    }
    if bcrypt.CompareHashAndPassword([]byte(row.CodeHash), []byte(req.Code)) != nil {
        s.DB.Exec("UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?", row.ID)
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_code","message":"Invalid or already used"})
        return
    }
    token := s.TokenGenerator()
    sum := sha256.Sum256([]byte(token))
    tokenHash := hex.EncodeToString(sum[:])
    rtExp := time.Now().Add(10 * time.Minute)
    s.DB.Exec("UPDATE password_resets SET used_at = now(), reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?", tokenHash, rtExp, row.ID)
    c.JSON(http.StatusOK, gin.H{"resetToken": token, "expiresAt": rtExp, "next": "reset"})
}

func (s *Server) forgotReset(c *gin.Context) {
    var req resetRequest
    if err := c.ShouldBindJSON(&req); err != nil || req.ResetToken == "" || req.NewPassword == "" || req.ConfirmPassword == "" {
        c.JSON(http.StatusBadRequest, gin.H{"code":"invalid_parameters","message":"missing fields"})
        return
    }
    if req.NewPassword != req.ConfirmPassword {
        c.JSON(http.StatusBadRequest, gin.H{"code":"password_mismatch","message":"Passwords do not match"})
        return
    }
    sum := sha256.Sum256([]byte(req.ResetToken))
    tokenHash := hex.EncodeToString(sum[:])
    var row struct{ ID string; UserID string; ResetTokenExpiresAt time.Time }
    s.DB.Raw("SELECT id, user_id, reset_token_expires_at FROM password_resets WHERE reset_token_hash = ? LIMIT 1", tokenHash).Scan(&row)
    if row.ID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"code":"unauthorized","message":"invalid reset token"})
        return
    }
    if time.Now().After(row.ResetTokenExpiresAt) {
        c.JSON(http.StatusGone, gin.H{"code":"expired","message":"Reset token expired"})
        return
    }
    hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    s.DB.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hash), row.UserID)
    s.DB.Exec("UPDATE sessions SET revoked_at = now() WHERE user_id = ?", row.UserID)
    s.DB.Exec("DELETE FROM password_resets WHERE id = ?", row.ID)
    c.JSON(http.StatusOK, gin.H{"next":"login"})
}