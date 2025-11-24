package server

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"

    "cs3604/backend/internal/config"
    "cs3604/backend/internal/db"
    "github.com/stretchr/testify/require"
)

func TestAPI_Auth_Forgot_Reset(t *testing.T) {
    cfg := config.LoadDB()
    gdb, err := db.Open(cfg.DSN())
    require.NoError(t, err)
    s := New(gdb)
    s.CodeGenerator = func() string { return "123456" }
    s.TokenGenerator = func() string { return "tok123" }

    reg := map[string]any{
        "nationality": "CN",
        "name": "User",
        "passportNumber": "P0001",
        "passportExpirationDate": time.Now().AddDate(5,0,0).Format("2006-01-02"),
        "dateOfBirth": time.Now().AddDate(-20,0,0).Format("2006-01-02"),
        "gender": "male",
        "username": "f_"+time.Now().Format("150405"),
        "password": "OldPass1!",
        "email": "f_"+time.Now().Format("150405")+"@example.com",
        "agreeTerms": true,
    }
    bodyReg, _ := json.Marshal(reg)
    wr := httptest.NewRecorder()
    rr := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(bodyReg))
    rr.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(wr, rr)
    require.Equal(t, http.StatusCreated, wr.Code)

    fr := httptest.NewRecorder()
    fb := bytes.NewBuffer(nil)
    _ = json.NewEncoder(fb).Encode(map[string]any{"identifier": reg["username"]})
    fq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/forgot", fb)
    fq.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(fr, fq)
    require.Equal(t, http.StatusAccepted, fr.Code)

    fv := httptest.NewRecorder()
    vb := bytes.NewBuffer(nil)
    _ = json.NewEncoder(vb).Encode(map[string]any{"identifier": reg["username"], "code": "123456"})
    vq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/forgot/verify", vb)
    vq.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(fv, vq)
    require.Equal(t, http.StatusOK, fv.Code)

    fs := httptest.NewRecorder()
    sb := bytes.NewBuffer(nil)
    _ = json.NewEncoder(sb).Encode(map[string]any{"resetToken": "tok123", "newPassword": "NewPass1!", "confirmPassword": "NewPass1!"})
    sq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/forgot/reset", sb)
    sq.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(fs, sq)
    require.Equal(t, http.StatusOK, fs.Code)

    wl := httptest.NewRecorder()
    bl := bytes.NewBuffer(nil)
    _ = json.NewEncoder(bl).Encode(map[string]any{"identifier": reg["username"], "password": "NewPass1!"})
    rq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bl)
    rq.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(wl, rq)
    require.Equal(t, http.StatusOK, wl.Code)

    wlf := httptest.NewRecorder()
    blf := bytes.NewBuffer(nil)
    _ = json.NewEncoder(blf).Encode(map[string]any{"identifier": reg["username"], "password": "OldPass1!"})
    rqf := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", blf)
    rqf.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(wlf, rqf)
    require.Equal(t, http.StatusUnauthorized, wlf.Code)
}