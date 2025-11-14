package repo

import (
    "errors"
    "time"

    "gorm.io/gorm"
)

type Repo struct{ DB *gorm.DB }

func New(db *gorm.DB) *Repo { return &Repo{DB: db} }

// Extensions
func (r *Repo) Extensions() ([]string, error) {
    var names []string
    res := r.DB.Raw("SELECT extname FROM pg_extension ORDER BY extname").Scan(&names)
    return names, res.Error
}

// Enums values by type name
func (r *Repo) EnumValues(typeName string) ([]string, error) {
    var values []string
    q := `SELECT e.enumlabel
          FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = ? ORDER BY e.enumsortorder`
    res := r.DB.Raw(q, typeName).Scan(&values)
    return values, res.Error
}

// Stations by code
type StationRow struct{ ID string; Code string }

func (r *Repo) StationsByCodes(codes []string) ([]StationRow, error) {
    var rows []StationRow
    res := r.DB.Raw("SELECT id, code FROM stations WHERE code IN ?", codes).Scan(&rows)
    return rows, res.Error
}

// Train service & segment lookup
func (r *Repo) ServiceAndSegment(trainNo string, date time.Time, fromID, toID string) (int64, int64, error) {
    var svcID int64
    if err := r.DB.Raw("SELECT id FROM train_services WHERE train_no = ? AND service_date = ?", trainNo, date.Format("2006-01-02")).Scan(&svcID).Error; err != nil {
        return 0, 0, err
    }
    if svcID == 0 { return 0, 0, errors.New("service not found") }
    var segID int64
    if err := r.DB.Raw("SELECT id FROM service_segments WHERE train_service_id = ? AND from_station_id = ? AND to_station_id = ?", svcID, fromID, toID).Scan(&segID).Error; err != nil {
        return 0, 0, err
    }
    if segID == 0 { return 0, 0, errors.New("segment not found") }
    return svcID, segID, nil
}

// Inventory left by segment & seat
func (r *Repo) InventoryLeft(segmentID int64, seatType string) (int, error) {
    var left int
    err := r.DB.Raw("SELECT left_seats FROM segment_seat_inventory WHERE segment_id = ? AND seat_type = ?", segmentID, seatType).Scan(&left).Error
    return left, err
}

// Create preorder (hold 1 seat) and return id
func (r *Repo) CreatePreorder(userID string, svcID, segID int64, fromID, toID, seatType string, expires time.Time) (string, error) {
    var id string
    err := r.DB.Raw(`INSERT INTO preorders(user_id,train_service_id,from_station_id,to_station_id,segment_id,seat_type,hold_quantity,expires_at)
                    VALUES (?,?,?,?,?,?,1,?) RETURNING id`, userID, svcID, fromID, toID, segID, seatType, expires).Scan(&id).Error
    return id, err
}

// Update preorder status
func (r *Repo) UpdatePreorderStatus(id string, status string) error {
    return r.DB.Exec("UPDATE preorders SET status = ? WHERE id = ?", status, id).Error
}

// Insert train service (for trigger test)
func (r *Repo) InsertTrainService(trainNo string, date time.Time) error {
    return r.DB.Exec("INSERT INTO train_services(train_no, service_date) VALUES (?, ?)", trainNo, date.Format("2006-01-02")).Error
}

// Test helpers
func (r *Repo) CreateUser(username, email, passwordHash string) (string, error) {
    var id string
    err := r.DB.Raw(`INSERT INTO users(username,email,password_hash,status)
                     VALUES (?,?,?, 'active') RETURNING id`, username, email, passwordHash).Scan(&id).Error
    return id, err
}

func (r *Repo) DeleteUser(id string) error {
    return r.DB.Exec("DELETE FROM users WHERE id = ?", id).Error
}

// Sessions
func (r *Repo) CreateSession(userID string, expires time.Time) (string, error) {
    var sid string
    err := r.DB.Raw("INSERT INTO sessions(user_id, expires_at) VALUES (?, ?) RETURNING sid", userID, expires).Scan(&sid).Error
    return sid, err
}

func (r *Repo) SessionUser(sid string) (string, error) {
    var uid string
    err := r.DB.Raw("SELECT user_id FROM sessions WHERE sid = ? AND (revoked_at IS NULL) AND expires_at > now()", sid).Scan(&uid).Error
    return uid, err
}

func (r *Repo) RevokeSession(sid string) error {
    return r.DB.Exec("UPDATE sessions SET revoked_at = now() WHERE sid = ?", sid).Error
}

// Search view items
type TrainSearchItem struct {
    TrainServiceID int64  `gorm:"column:train_service_id"`
    TrainNo        string `gorm:"column:train_no"`
    TrainType      string `gorm:"column:train_type"`
    SegmentID      int64  `gorm:"column:segment_id"`
    FromStationID  string `gorm:"column:from_station_id"`
    ToStationID    string `gorm:"column:to_station_id"`
    DepartTime     string `gorm:"column:depart_time"`
    ArriveTime     string `gorm:"column:arrive_time"`
    Duration       string `gorm:"column:duration"`
    Date           string `gorm:"column:date"`
    Bookable       bool   `gorm:"column:bookable"`
    SeatsJSON      []byte `gorm:"column:seats"`
}

func (r *Repo) SearchView(fromID, toID string, date time.Time, departStart, departEnd string, highSpeedOnly bool) ([]TrainSearchItem, error) {
    sql := `SELECT train_service_id, train_no, train_type, segment_id, from_station_id, to_station_id,
                   depart_time, arrive_time, duration, date, bookable, seats
            FROM v_train_search WHERE from_station_id = ? AND to_station_id = ? AND date = ?`
    args := []any{fromID, toID, date.Format("2006-01-02")}
    if departStart != "" && departEnd != "" {
        sql += " AND depart_time BETWEEN ? AND ?"
        args = append(args, departStart, departEnd)
    }
    if highSpeedOnly {
        sql += " AND train_type IN ('G','D','C')"
    }
    sql += " ORDER BY depart_time ASC"
    var items []TrainSearchItem
    res := r.DB.Raw(sql, args...).Scan(&items)
    return items, res.Error
}