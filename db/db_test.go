package main

import (
	"context"
	"database/sql"
	"testing"
	"time"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestDBConnectionSQL(t *testing.T) {
	db, err := sql.Open("postgres", dsn())
	if err != nil {
		t.Fatalf("sql.Open: %v", err)
	}
	defer db.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		t.Fatalf("ping: %v", err)
	}
}

func TestDBConnectionGorm(t *testing.T) {
	g, err := gorm.Open(postgres.Open(dsn()), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		t.Fatalf("gorm.Open: %v", err)
	}
	sqlDB, err := g.DB()
	if err != nil {
		t.Fatalf("DB(): %v", err)
	}
	defer sqlDB.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := sqlDB.PingContext(ctx); err != nil {
		t.Fatalf("gorm ping: %v", err)
	}
}

func TestStationsQuery(t *testing.T) {
	db, err := sql.Open("postgres", dsn())
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	defer db.Close()
	var code, name string
	if err := db.QueryRow(`SELECT code,name_en FROM stations WHERE code='BJP'`).Scan(&code, &name); err != nil {
		t.Fatalf("query: %v", err)
	}
	if code != "BJP" {
		t.Fatalf("unexpected code: %s", code)
	}
}

func TestTrainSearchView(t *testing.T) {
	db, err := sql.Open("postgres", dsn())
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	defer db.Close()
	rows, err := db.Query(`SELECT train_no, date, bookable, seats FROM v_train_search WHERE date=current_date LIMIT 3`)
	if err != nil {
		t.Fatalf("v_train_search: %v", err)
	}
	defer rows.Close()
	count := 0
	for rows.Next() {
		var trainNo string
		var date time.Time
		var bookable bool
		var seats string
		if err := rows.Scan(&trainNo, &date, &bookable, &seats); err != nil {
			t.Fatalf("scan: %v", err)
		}
		count++
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("rows err: %v", err)
	}
	if count == 0 {
		t.Fatalf("no search results")
	}
}

func TestPreorderInventory(t *testing.T) {
	db, err := sql.Open("postgres", dsn())
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	defer db.Close()
	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("begin: %v", err)
	}
	defer tx.Rollback()
	var tsID, segID int64
	if err := tx.QueryRow(`SELECT ts.id, seg.id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&tsID, &segID); err != nil {
		t.Fatalf("pick: %v", err)
	}
	var invBefore int
	if err := tx.QueryRow(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=$1 AND seat_type='second'`, segID).Scan(&invBefore); err != nil {
		t.Fatalf("inv before: %v", err)
	}
	var userID string
	if err := tx.QueryRow(`SELECT id FROM users WHERE username='demo'`).Scan(&userID); err != nil {
		t.Fatalf("user: %v", err)
	}
	var fromID, toID string
	if err := tx.QueryRow(`SELECT from_station_id, to_station_id FROM service_segments WHERE id=$1`, segID).Scan(&fromID, &toID); err != nil {
		t.Fatalf("stations: %v", err)
	}
	var preorderID string
	if err := tx.QueryRow(`INSERT INTO preorders(user_id,train_service_id,from_station_id,to_station_id,segment_id,seat_type,hold_quantity,status,expires_at) VALUES($1,$2,$3,$4,$5,'second',1,'active', now() + interval '15 minutes') RETURNING id`, userID, tsID, fromID, toID, segID).Scan(&preorderID); err != nil {
		t.Fatalf("insert preorder: %v", err)
	}
	var invAfter int
	if err := tx.QueryRow(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=$1 AND seat_type='second'`, segID).Scan(&invAfter); err != nil {
		t.Fatalf("inv after: %v", err)
	}
	if invAfter != invBefore-1 {
		t.Fatalf("not decremented: %d -> %d", invBefore, invAfter)
	}
	if _, err := tx.Exec(`UPDATE preorders SET status='canceled' WHERE id=$1`, preorderID); err != nil {
		t.Fatalf("cancel: %v", err)
	}
	if err := tx.QueryRow(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=$1 AND seat_type='second'`, segID).Scan(&invAfter); err != nil {
		t.Fatalf("inv after cancel: %v", err)
	}
	if invAfter != invBefore {
		t.Fatalf("not released: expect %d got %d", invBefore, invAfter)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("commit: %v", err)
	}
}

func TestOrderCancelInventory(t *testing.T) {
	g, err := gorm.Open(postgres.Open(dsn()), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		t.Fatalf("gorm.Open: %v", err)
	}
	tx := g.Begin()
	if tx.Error != nil {
		t.Fatalf("begin: %v", tx.Error)
	}
	var pair struct {
		TrainServiceID int64
		SegmentID      int64
	}
	if err := tx.Raw(`SELECT ts.id AS train_service_id, seg.id AS segment_id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&pair).Error; err != nil {
		t.Fatalf("pair: %v", err)
	}
	var st struct {
		From string
		To   string
	}
	if err := tx.Raw(`SELECT from_station_id AS from, to_station_id AS to FROM service_segments WHERE id=$1`, pair.SegmentID).Scan(&st).Error; err != nil {
		t.Fatalf("stations: %v", err)
	}
	var user struct{ ID string }
	if err := tx.Raw(`SELECT id FROM users WHERE username='demo'`).Scan(&user).Error; err != nil {
		t.Fatalf("user: %v", err)
	}
	if err := tx.Exec(`INSERT INTO orders(user_id,train_service_id,from_station_id,to_station_id,segment_id,status,total_price_cents,expires_at) VALUES (?,?,?,?,?,?,?,?)`, user.ID, pair.TrainServiceID, st.From, st.To, pair.SegmentID, "pending_payment", 31800, time.Now().Add(15*time.Minute)).Error; err != nil {
		t.Fatalf("insert order: %v", err)
	}
	var ord struct{ ID string }
	if err := tx.Raw(`SELECT id FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, user.ID).Scan(&ord).Error; err != nil {
		t.Fatalf("order id: %v", err)
	}
	var invBefore int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invBefore).Error; err != nil {
		t.Fatalf("inv before: %v", err)
	}
	if err := tx.Exec(`INSERT INTO tickets(order_id,passenger_name,passenger_card_type,passenger_card_no,seat_type,ticket_type,price_cents,status) VALUES (?,?,?,?,?,?,?,?)`, ord.ID, "Demo Passenger", "passport", "P123456", "second", "adult", 31800, "active").Error; err != nil {
		t.Fatalf("insert ticket: %v", err)
	}
	var invAfter int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invAfter).Error; err != nil {
		t.Fatalf("inv after: %v", err)
	}
	if invAfter != invBefore-1 {
		t.Fatalf("decrement failed: %d -> %d", invBefore, invAfter)
	}
	if err := tx.Exec(`UPDATE orders SET status='canceled' WHERE id=?`, ord.ID).Error; err != nil {
		t.Fatalf("cancel order: %v", err)
	}
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invAfter).Error; err != nil {
		t.Fatalf("inv after cancel: %v", err)
	}
	if invAfter != invBefore {
		t.Fatalf("release failed: expect %d got %d", invBefore, invAfter)
	}
	if err := tx.Commit().Error; err != nil {
		t.Fatalf("commit: %v", err)
	}
}

func TestTicketRefundInventory(t *testing.T) {
	g, err := gorm.Open(postgres.Open(dsn()), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		t.Fatalf("gorm.Open: %v", err)
	}
	tx := g.Begin()
	if tx.Error != nil {
		t.Fatalf("begin: %v", tx.Error)
	}
	var pair struct {
		TrainServiceID int64
		SegmentID      int64
	}
	if err := tx.Raw(`SELECT ts.id AS train_service_id, seg.id AS segment_id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&pair).Error; err != nil {
		t.Fatalf("pair: %v", err)
	}
	var st struct {
		From string
		To   string
	}
	if err := tx.Raw(`SELECT from_station_id AS from, to_station_id AS to FROM service_segments WHERE id=$1`, pair.SegmentID).Scan(&st).Error; err != nil {
		t.Fatalf("stations: %v", err)
	}
	var user struct{ ID string }
	if err := tx.Raw(`SELECT id FROM users WHERE username='demo'`).Scan(&user).Error; err != nil {
		t.Fatalf("user: %v", err)
	}
	if err := tx.Exec(`INSERT INTO orders(user_id,train_service_id,from_station_id,to_station_id,segment_id,status,total_price_cents,expires_at,paid_at) VALUES (?,?,?,?,?,?,?,?,?)`, user.ID, pair.TrainServiceID, st.From, st.To, pair.SegmentID, "paid", 31800, time.Now().Add(30*time.Minute), time.Now()).Error; err != nil {
		t.Fatalf("insert order: %v", err)
	}
	var ord struct{ ID string }
	if err := tx.Raw(`SELECT id FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, user.ID).Scan(&ord).Error; err != nil {
		t.Fatalf("order id: %v", err)
	}
	var invBefore int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invBefore).Error; err != nil {
		t.Fatalf("inv before: %v", err)
	}
	if err := tx.Exec(`INSERT INTO tickets(order_id,passenger_name,passenger_card_type,passenger_card_no,seat_type,ticket_type,price_cents,status) VALUES (?,?,?,?,?,?,?,?)`, ord.ID, "Demo Passenger", "passport", "P987654", "second", "adult", 31800, "active").Error; err != nil {
		t.Fatalf("insert ticket: %v", err)
	}
	var invAfter int
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invAfter).Error; err != nil {
		t.Fatalf("inv after: %v", err)
	}
	if invAfter != invBefore-1 {
		t.Fatalf("decrement failed: %d -> %d", invBefore, invAfter)
	}
	if err := tx.Exec(`UPDATE tickets SET status='refunded' WHERE order_id=?`, ord.ID).Error; err != nil {
		t.Fatalf("refund: %v", err)
	}
	if err := tx.Raw(`SELECT left_seats FROM segment_seat_inventory WHERE segment_id=? AND seat_type='second'`, pair.SegmentID).Scan(&invAfter).Error; err != nil {
		t.Fatalf("inv after refund: %v", err)
	}
	if invAfter != invBefore {
		t.Fatalf("release failed: expect %d got %d", invBefore, invAfter)
	}
	if err := tx.Commit().Error; err != nil {
		t.Fatalf("commit: %v", err)
	}
}

func TestUserOrdersView(t *testing.T) {
	// ensure there is at least one order
	g, err := gorm.Open(postgres.Open(dsn()), &gorm.Config{SkipDefaultTransaction: true})
	if err != nil {
		t.Fatalf("gorm.Open: %v", err)
	}
	tx := g.Begin()
	if tx.Error != nil {
		t.Fatalf("begin: %v", tx.Error)
	}
	var pair struct {
		TrainServiceID int64
		SegmentID      int64
	}
	if err := tx.Raw(`SELECT ts.id AS train_service_id, seg.id AS segment_id FROM train_services ts JOIN service_segments seg ON seg.train_service_id=ts.id WHERE ts.service_date=current_date LIMIT 1`).Scan(&pair).Error; err != nil {
		t.Fatalf("pair: %v", err)
	}
	var st struct {
		From string
		To   string
	}
	if err := tx.Raw(`SELECT from_station_id AS from, to_station_id AS to FROM service_segments WHERE id=$1`, pair.SegmentID).Scan(&st).Error; err != nil {
		t.Fatalf("stations: %v", err)
	}
	var user struct{ ID string }
	if err := tx.Raw(`SELECT id FROM users WHERE username='demo'`).Scan(&user).Error; err != nil {
		t.Fatalf("user: %v", err)
	}
	if err := tx.Exec(`INSERT INTO orders(user_id,train_service_id,from_station_id,to_station_id,segment_id,status,total_price_cents,expires_at) VALUES (?,?,?,?,?,?,?,?)`, user.ID, pair.TrainServiceID, st.From, st.To, pair.SegmentID, "pending_payment", 31800, time.Now().Add(15*time.Minute)).Error; err != nil {
		t.Fatalf("insert order: %v", err)
	}
	if err := tx.Commit().Error; err != nil {
		t.Fatalf("commit: %v", err)
	}

	db, err := sql.Open("postgres", dsn())
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	defer db.Close()
	rows, err := db.Query(`SELECT order_id, user_id, train_service_id, total_price_cents FROM v_user_orders LIMIT 5`)
	if err != nil {
		t.Fatalf("v_user_orders: %v", err)
	}
	defer rows.Close()
	count := 0
	for rows.Next() {
		var oid, uid string
		var tsid int64
		var total int
		if err := rows.Scan(&oid, &uid, &tsid, &total); err != nil {
			t.Fatalf("scan: %v", err)
		}
		count++
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("rows err: %v", err)
	}
	if count == 0 {
		t.Fatalf("no orders in view")
	}
}
