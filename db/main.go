package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID           string  `gorm:"type:uuid;primaryKey"`
	Username     string  `gorm:"type:citext;uniqueIndex"`
	Email        *string `gorm:"type:citext;uniqueIndex"`
	Mobile       *string `gorm:"type:citext;uniqueIndex"`
	PasswordHash string
	Name         *string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func dsn() string {
	host := getenv("PGHOST", "127.0.0.1")
	port := getenv("PGPORT", "5432")
	user := getenv("PGUSER", "postgres")
	pass := getenv("PGPASSWORD", "postgres")
	db := getenv("PGDATABASE", "railway12306")
	ssl := getenv("PGSSLMODE", "disable")
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Shanghai", host, port, user, pass, db, ssl)
}

func getenv(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	return v
}

func mustSQL() *sql.DB {
	d := dsn()
	db, err := sql.Open("postgres", d)
	if err != nil {
		log.Fatalf("sql.Open: %v", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("ping: %v", err)
	}
	return db
}

func mustGorm() *gorm.DB {
	d := dsn()
	g, err := gorm.Open(postgres.Open(d), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		log.Fatalf("gorm.Open: %v", err)
	}
	sqlDB, err := g.DB()
	if err != nil {
		log.Fatalf("DB(): %v", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := sqlDB.PingContext(ctx); err != nil {
		log.Fatalf("gorm ping: %v", err)
	}
	return g
}

func main() {
	sqlDB := mustSQL()
	g := mustGorm()
	mustQuery(sqlDB)
	mustTrainSearch(sqlDB)
	mustPreorderFlow(sqlDB)
	mustOrderTicketFlow(g)
	mustTicketRefundFlow(g)
	mustUserOrdersView(sqlDB)
	fmt.Println("OK: all DB functionalities covered")
}

func mustQuery(db *sql.DB) {
	row := db.QueryRow(`SELECT code,name_en FROM stations WHERE code='BJP'`)
	var code, name string
	if err := row.Scan(&code, &name); err != nil {
		log.Fatalf("query stations: %v", err)
	}
}

func mustTrainSearch(db *sql.DB) {
	q := `SELECT train_no, date, bookable, seats FROM v_train_search WHERE date=current_date LIMIT 5`
	rows, err := db.Query(q)
	if err != nil {
		log.Fatalf("v_train_search: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var trainNo string
		var date time.Time
		var bookable bool
		var seats string
		if err := rows.Scan(&trainNo, &date, &bookable, &seats); err != nil {
			log.Fatalf("scan search: %v", err)
		}
	}
	if err := rows.Err(); err != nil {
		log.Fatalf("rows err: %v", err)
	}
}

func mustPreorderFlow(db *sql.DB) {
	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("begin: %v", err)
	}
	defer tx.Rollback()

	var tsID, segID int64
	var seatType string
	seatType = "second"
	err = tx.QueryRow(`SELECT ts.id, seg.id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&tsID, &segID)
	if err != nil {
		log.Fatalf("pick segment: %v", err)
	}

	var invBefore int
	if err := tx.QueryRow(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=$1 AND seat_type=$2`, segID, seatType).Scan(&invBefore); err != nil {
		log.Fatalf("inv before: %v", err)
	}

	var userID string
	if err := tx.QueryRow(`SELECT id FROM users WHERE username='demo'`).Scan(&userID); err != nil {
		log.Fatalf("user: %v", err)
	}

	var fromID, toID string
	if err := tx.QueryRow(`SELECT from_station_id, to_station_id FROM service_segments WHERE id=$1`, segID).Scan(&fromID, &toID); err != nil {
		log.Fatalf("segment stations: %v", err)
	}

	var preorderID string
	if err := tx.QueryRow(`INSERT INTO preorders(user_id,train_service_id,from_station_id,to_station_id,segment_id,seat_type,hold_quantity,expires_at) VALUES($1,$2,$3,$4,$5,$6,1, now()+ interval '15 minutes') RETURNING id`, userID, tsID, fromID, toID, segID, seatType).Scan(&preorderID); err != nil {
		log.Fatalf("insert preorder: %v", err)
	}

	var invAfter int
	if err := tx.QueryRow(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=$1 AND seat_type=$2`, segID, seatType).Scan(&invAfter); err != nil {
		log.Fatalf("inv after: %v", err)
	}
	if invAfter != invBefore-1 {
		log.Fatalf("inventory not decremented: %d -> %d", invBefore, invAfter)
	}

	if _, err := tx.Exec(`UPDATE preorders SET status='canceled' WHERE id=$1`, preorderID); err != nil {
		log.Fatalf("cancel preorder: %v", err)
	}
	if err := tx.QueryRow(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=$1 AND seat_type=$2`, segID, seatType).Scan(&invAfter); err != nil {
		log.Fatalf("inv after cancel: %v", err)
	}
	if invAfter != invBefore {
		log.Fatalf("inventory not released: expect %d got %d", invBefore, invAfter)
	}
	if err := tx.Commit(); err != nil {
		log.Fatalf("commit: %v", err)
	}
}

func mustOrderTicketFlow(g *gorm.DB) {
	type Order struct {
		ID              string `gorm:"type:uuid;primaryKey"`
		TrainServiceID  int64
		SegmentID       int64
		FromStationID   string
		ToStationID     string
		UserID          string
		Status          string
		TotalPriceCents int
		CreatedAt       time.Time
		ExpiresAt       time.Time
	}
	type Ticket struct {
		ID                int64 `gorm:"primaryKey"`
		OrderID           string
		PassengerName     string
		PassengerCardType string
		PassengerCardNo   string
		SeatType          string
		TicketType        string
		PriceCents        int
		Status            string
		CreatedAt         time.Time
		UpdatedAt         time.Time
	}

	var segID int64
	var tsID int64
	if err := g.Raw(`SELECT ts.id, seg.id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&[]struct{ ID1, ID2 int64 }{}).Error; err != nil {
		// fallback use sql
	}
	var pair struct {
		TrainServiceID int64
		SegmentID      int64
	}
	if err := g.Raw(`SELECT ts.id AS train_service_id, seg.id AS segment_id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&pair).Error; err != nil {
		log.Fatalf("pair: %v", err)
	}
	tsID, segID = pair.TrainServiceID, pair.SegmentID

	var st struct {
		From string
		To   string
	}
	if err := g.Raw(`SELECT from_station_id AS from, to_station_id AS to FROM service_segments WHERE id=$1`, segID).Scan(&st).Error; err != nil {
		log.Fatalf("segment stations: %v", err)
	}

	var user struct{ ID string }
	if err := g.Raw(`SELECT id FROM users WHERE username='demo'`).Scan(&user).Error; err != nil {
		log.Fatalf("user: %v", err)
	}

	tx := g.Begin()
	if tx.Error != nil {
		log.Fatalf("begin gorm: %v", tx.Error)
	}
	ord := Order{UserID: user.ID, TrainServiceID: tsID, SegmentID: segID, FromStationID: st.From, ToStationID: st.To, Status: "pending_payment", TotalPriceCents: 31800, ExpiresAt: time.Now().Add(15 * time.Minute)}
	if err := tx.Exec(`INSERT INTO orders(user_id,train_service_id,from_station_id,to_station_id,segment_id,status,total_price_cents,expires_at) VALUES (?,?,?,?,?,?,?,?)`, ord.UserID, ord.TrainServiceID, ord.FromStationID, ord.ToStationID, ord.SegmentID, ord.Status, ord.TotalPriceCents, ord.ExpiresAt).Error; err != nil {
		log.Fatalf("insert order: %v", err)
	}
	if err := tx.Raw(`SELECT id FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, ord.UserID).Scan(&ord).Error; err != nil {
		log.Fatalf("get order id: %v", err)
	}

	var invBefore int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, segID).Scan(&invBefore).Error; err != nil {
		log.Fatalf("inv before: %v", err)
	}

	t := Ticket{OrderID: ord.ID, PassengerName: "Demo Passenger", PassengerCardType: "passport", PassengerCardNo: "P123456", SeatType: "second", TicketType: "adult", PriceCents: 31800, Status: "active"}
	if err := tx.Exec(`INSERT INTO tickets(order_id,passenger_name,passenger_card_type,passenger_card_no,seat_type,ticket_type,price_cents,status) VALUES (?,?,?,?,?,?,?,?)`, t.OrderID, t.PassengerName, t.PassengerCardType, t.PassengerCardNo, t.SeatType, t.TicketType, t.PriceCents, t.Status).Error; err != nil {
		log.Fatalf("insert ticket: %v", err)
	}

	var invAfter int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, segID).Scan(&invAfter).Error; err != nil {
		log.Fatalf("inv after: %v", err)
	}
	if invAfter != invBefore-1 {
		log.Fatalf("ticket decrement failed: %d -> %d", invBefore, invAfter)
	}

	if err := tx.Exec(`UPDATE orders SET status='canceled' WHERE id=?`, ord.ID).Error; err != nil {
		log.Fatalf("cancel order: %v", err)
	}
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, segID).Scan(&invAfter).Error; err != nil {
		log.Fatalf("inv after cancel: %v", err)
	}
	if invAfter != invBefore {
		log.Fatalf("order cancel release failed: expect %d got %d", invBefore, invAfter)
	}

	if err := tx.Commit().Error; err != nil {
		log.Fatalf("commit: %v", err)
	}
}

func mustTicketRefundFlow(g *gorm.DB) {
	var pair struct {
		TrainServiceID int64
		SegmentID      int64
	}
	if err := g.Raw(`SELECT ts.id AS train_service_id, seg.id AS segment_id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&pair).Error; err != nil {
		log.Fatalf("pair: %v", err)
	}
	var st struct {
		From string
		To   string
	}
	if err := g.Raw(`SELECT from_station_id AS from, to_station_id AS to FROM service_segments WHERE id=$1`, pair.SegmentID).Scan(&st).Error; err != nil {
		log.Fatalf("segment stations: %v", err)
	}
	var user struct{ ID string }
	if err := g.Raw(`SELECT id FROM users WHERE username='demo'`).Scan(&user).Error; err != nil {
		log.Fatalf("user: %v", err)
	}

	tx := g.Begin()
	if tx.Error != nil {
		log.Fatalf("begin: %v", tx.Error)
	}
	if err := tx.Exec(`INSERT INTO orders(user_id,train_service_id,from_station_id,to_station_id,segment_id,status,total_price_cents,expires_at) VALUES (?,?,?,?,?,?,?,?)`, user.ID, pair.TrainServiceID, st.From, st.To, pair.SegmentID, "paid", 31800, time.Now().Add(30*time.Minute)).Error; err != nil {
		log.Fatalf("insert order: %v", err)
	}
	var ord struct{ ID string }
	if err := tx.Raw(`SELECT id FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, user.ID).Scan(&ord).Error; err != nil {
		log.Fatalf("order id: %v", err)
	}

	var invBefore int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invBefore).Error; err != nil {
		log.Fatalf("inv before: %v", err)
	}
	if err := tx.Exec(`INSERT INTO tickets(order_id,passenger_name,passenger_card_type,passenger_card_no,seat_type,ticket_type,price_cents,status) VALUES (?,?,?,?,?,?,?,?)`, ord.ID, "Demo Passenger", "passport", "P987654", "second", "adult", 31800, "active").Error; err != nil {
		log.Fatalf("insert ticket: %v", err)
	}
	var invAfter int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invAfter).Error; err != nil {
		log.Fatalf("inv after insert: %v", err)
	}
	if invAfter != invBefore-1 {
		log.Fatalf("decrement failed: %d -> %d", invBefore, invAfter)
	}

	if err := tx.Exec(`UPDATE tickets SET status='refunded' WHERE order_id=?`, ord.ID).Error; err != nil {
		log.Fatalf("refund ticket: %v", err)
	}
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invAfter).Error; err != nil {
		log.Fatalf("inv after refund: %v", err)
	}
	if invAfter != invBefore {
		log.Fatalf("refund release failed: expect %d got %d", invBefore, invAfter)
	}
	if err := tx.Commit().Error; err != nil {
		log.Fatalf("commit: %v", err)
	}
}

func mustUserOrdersView(db *sql.DB) {
	rows, err := db.Query(`SELECT order_id, user_id, train_service_id, total_price_cents FROM v_user_orders LIMIT 5`)
	if err != nil {
		log.Fatalf("v_user_orders: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var oid, uid string
		var tsid int64
		var total int
		if err := rows.Scan(&oid, &uid, &tsid, &total); err != nil {
			log.Fatalf("scan: %v", err)
		}
	}
	if err := rows.Err(); err != nil {
		log.Fatalf("rows err: %v", err)
	}
}
