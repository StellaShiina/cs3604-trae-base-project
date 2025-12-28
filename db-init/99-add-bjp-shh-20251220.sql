-- Add G3 Beijing -> Shanghai for 2025-12-20

-- 1. Ensure train exists
INSERT INTO trains(train_no, train_type) VALUES ('G3', 'G') ON CONFLICT (train_no) DO NOTHING;

-- 2. Insert Train Service
INSERT INTO train_services(train_no, service_date)
SELECT 'G3', '2025-12-20'
WHERE '2025-12-20'::date BETWEEN current_date AND (current_date + INTERVAL '15 days')::date
AND NOT EXISTS (
    SELECT 1 FROM train_services WHERE train_no = 'G3' AND service_date = '2025-12-20'
);

-- 3. Insert Service Stops (Beijing -> Shanghai)
-- Using G1 as template: 07:00-11:30. Let's make G3 10:00-14:30.

-- Stop 1: Beijing (BJP)
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 1, NULL, '10:00'::time
FROM train_services ts
JOIN stations s ON s.code = 'BJP'
WHERE ts.train_no = 'G3' AND ts.service_date = '2025-12-20'
ON CONFLICT (train_service_id, stop_seq) DO NOTHING;

-- Stop 2: Shanghai (SHH)
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 2, '14:30'::time, NULL
FROM train_services ts
JOIN stations s ON s.code = 'SHH'
WHERE ts.train_no = 'G3' AND ts.service_date = '2025-12-20'
ON CONFLICT (train_service_id, stop_seq) DO NOTHING;

-- 4. Insert Service Segment
INSERT INTO service_segments(train_service_id, from_stop_seq, to_stop_seq, from_station_id, to_station_id, depart_time, arrive_time, duration)
SELECT ts.id, 1, 2, s1.id, s2.id, '10:00'::time, '14:30'::time, '4 hours 30 minutes'::interval
FROM train_services ts
JOIN stations s1 ON s1.code = 'BJP'
JOIN stations s2 ON s2.code = 'SHH'
WHERE ts.train_no = 'G3' AND ts.service_date = '2025-12-20'
AND NOT EXISTS (
    SELECT 1 FROM service_segments seg WHERE seg.train_service_id = ts.id AND seg.from_stop_seq = 1 AND seg.to_stop_seq = 2
);

-- 5. Insert Seat Inventory (Copying G1 prices and capacity)
INSERT INTO segment_seat_inventory(train_service_id, segment_id, seat_type, total_seats, left_seats, price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id = ts.id AND seg.from_stop_seq = 1 AND seg.to_stop_seq = 2
JOIN (VALUES
  ('second'::seat_type_enum, 600, 300, 55000),
  ('first'::seat_type_enum, 200, 80, 93000),
  ('business'::seat_type_enum, 50, 25, 180000)
) AS x(seat_type, total, left_qty, price) ON true
WHERE ts.train_no = 'G3' AND ts.service_date = '2025-12-20'
ON CONFLICT (train_service_id, segment_id, seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats, left_seats=EXCLUDED.left_seats, price_cents=EXCLUDED.price_cents, currency='CNY';
