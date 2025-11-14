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
    "cs3604/backend/internal/repo"
    "github.com/stretchr/testify/require"
)

func newTestServer(t *testing.T) (*Server, *repo.Repo) {
    cfg := config.LoadDB()
    gdb, err := db.Open(cfg.DSN())
    require.NoError(t, err)
    return New(gdb), repo.New(gdb)
}

func TestAPI_DictionariesAndStations(t *testing.T) {
    s, _ := newTestServer(t)
    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/api/v1/dictionaries", nil)
    s.R.ServeHTTP(w, req)
    require.Equal(t, http.StatusOK, w.Code)

    w2 := httptest.NewRecorder()
    req2 := httptest.NewRequest(http.MethodGet, "/api/v1/stations?q=bei", nil)
    s.R.ServeHTTP(w2, req2)
    require.Equal(t, http.StatusOK, w2.Code)
}

func TestAPI_Auth_Register_Login_Session_Logout(t *testing.T) {
    s, _ := newTestServer(t)
    // register
    reg := map[string]any{
        "nationality": "CN",
        "name": "Test User",
        "passportNumber": "P1234567",
        "passportExpirationDate": time.Now().AddDate(5,0,0).Format("2006-01-02"),
        "dateOfBirth": time.Now().AddDate(-30,0,0).Format("2006-01-02"),
        "gender": "male",
        "username": "u_"+time.Now().Format("150405"),
        "password": "Passw0rd!",
        "email": "u_"+time.Now().Format("150405")+"@example.com",
        "agreeTerms": true,
    }
    body, _ := json.Marshal(reg)
    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(w, req)
    require.Equal(t, http.StatusCreated, w.Code)

    // login
    login := map[string]any{"identifier": reg["username"], "password": reg["password"]}
    body2, _ := json.Marshal(login)
    w2 := httptest.NewRecorder()
    req2 := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(body2))
    req2.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(w2, req2)
    require.Equal(t, http.StatusOK, w2.Code)
    // capture sid cookie
    setCookie := w2.Header().Get("Set-Cookie")
    require.NotEmpty(t, setCookie)

    // session/me
    w3 := httptest.NewRecorder()
    req3 := httptest.NewRequest(http.MethodGet, "/api/v1/session/me", nil)
    req3.Header.Set("Cookie", setCookie)
    s.R.ServeHTTP(w3, req3)
    require.Equal(t, http.StatusOK, w3.Code)

    // logout
    w4 := httptest.NewRecorder()
    req4 := httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
    req4.Header.Set("Cookie", setCookie)
    s.R.ServeHTTP(w4, req4)
    require.Equal(t, http.StatusNoContent, w4.Code)

    // session after logout should 401
    w5 := httptest.NewRecorder()
    req5 := httptest.NewRequest(http.MethodGet, "/api/v1/session/me", nil)
    req5.Header.Set("Cookie", setCookie)
    s.R.ServeHTTP(w5, req5)
    require.Equal(t, http.StatusUnauthorized, w5.Code)
}

func TestAPI_TrainsSearchAndPreorder(t *testing.T) {
    s, r := newTestServer(t)
    // ensure rolling 14 days in DB
    wj := httptest.NewRecorder()
    rj := httptest.NewRequest(http.MethodPost, "/internal/jobs/rolling14", nil)
    s.R.ServeHTTP(wj, rj)
    require.Equal(t, http.StatusOK, wj.Code)
    // pick stations via repo to avoid hard-coded IDs
    sts, err := r.StationsByCodes([]string{"BJP", "SHH"})
    require.NoError(t, err)
    require.Len(t, sts, 2)
    var bjp, shh string
    for _, s := range sts { if s.Code == "BJP" { bjp = s.ID } else if s.Code == "SHH" { shh = s.ID } }
    date := time.Now().Format("2006-01-02")

    // search
    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/api/v1/trains/search?fromStationId="+bjp+"&toStationId="+shh+"&date="+date+"&highSpeedOnly=true&departTimeStart=00:00&departTimeEnd=24:00", nil)
    s.R.ServeHTTP(w, req)
    require.Equal(t, http.StatusOK, w.Code)
    var resp struct{ Items []struct{ TrainNo string; Date string; TrainType string; Seats any } }
    require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
    require.GreaterOrEqual(t, len(resp.Items), 1)

    // register + login to create preorder
    reg := map[string]any{
        "nationality": "CN", "name": "Test User", "passportNumber": "P1234567",
        "passportExpirationDate": time.Now().AddDate(5,0,0).Format("2006-01-02"),
        "dateOfBirth": time.Now().AddDate(-30,0,0).Format("2006-01-02"),
        "gender": "male",
        "username": "p_"+time.Now().Format("150405"),
        "password": "Passw0rd!", "email": "p_"+time.Now().Format("150405")+"@example.com",
        "agreeTerms": true,
    }
    bodyReg, _ := json.Marshal(reg)
    wr := httptest.NewRecorder()
    rr := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(bodyReg))
    rr.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(wr, rr)
    require.Equal(t, http.StatusCreated, wr.Code)

    bodyLogin, _ := json.Marshal(map[string]any{"identifier": reg["username"], "password": reg["password"]})
    wl := httptest.NewRecorder()
    rl := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(bodyLogin))
    rl.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(wl, rl)
    require.Equal(t, http.StatusOK, wl.Code)
    cookie := wl.Header().Get("Set-Cookie")
    require.NotEmpty(t, cookie)

    // select a seat type with left > 0 via repo from view-derived segment
    _, segID, err := r.ServiceAndSegment("D5", time.Now(), bjp, shh)
    require.NoError(t, err)
    left := []string{"second","first","softSleeper"}
    seatType := "second"
    // pick first available seat type
    for _, st := range left {
        lf, err := r.InventoryLeft(segID, st)
        if err == nil && lf > 0 { seatType = st; break }
    }

    preorder := map[string]any{
        "trainNo": "D5", "date": date, "fromStationId": bjp, "toStationId": shh, "seatType": seatType,
    }
    bodyPO, _ := json.Marshal(preorder)
    wp := httptest.NewRecorder()
    rp := httptest.NewRequest(http.MethodPost, "/api/v1/preorders", bytes.NewReader(bodyPO))
    rp.Header.Set("Content-Type", "application/json")
    rp.Header.Set("Cookie", cookie)
    s.R.ServeHTTP(wp, rp)
    require.Equal(t, http.StatusCreated, wp.Code)

    // unauthorized preorder should be 401
    wpu := httptest.NewRecorder()
    rpu := httptest.NewRequest(http.MethodPost, "/api/v1/preorders", bytes.NewReader(bodyPO))
    rpu.Header.Set("Content-Type", "application/json")
    s.R.ServeHTTP(wpu, rpu)
    require.Equal(t, http.StatusUnauthorized, wpu.Code)
}