-- Nanjing (NJH) -> Hangzhou (HZH)
INSERT INTO train_services(train_no,service_date)
SELECT t.train_no, d::date FROM trains t
JOIN generate_series(current_date, current_date + INTERVAL '13 days', INTERVAL '1 day') AS d ON true
WHERE t.train_no IN ('D300','D301','D302')
AND NOT EXISTS (
  SELECT 1 FROM train_services ts WHERE ts.train_no = t.train_no AND ts.service_date = d::date
);

-- D300 12:00-14:20
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '12:00'::time FROM train_services ts JOIN stations s1 ON s1.code='NJH'
WHERE ts.train_no='D300' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '14:20'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='D300' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'12:00'::time,'14:20'::time,'2 hours 20 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='NJH' JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='D300' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,500,260,36000),
  ('first'::seat_type_enum,150,60,72000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='D300' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- D301 12:30-14:50（新增班次）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '12:30'::time FROM train_services ts JOIN stations s1 ON s1.code='NJH'
WHERE ts.train_no='D301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '14:50'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='D301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'12:30'::time,'14:50'::time,'2 hours 20 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='NJH' JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='D301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,520,270,36500),
  ('first'::seat_type_enum,160,62,72500)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='D301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- D302 13:00-15:15（新增班次）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '13:00'::time FROM train_services ts JOIN stations s1 ON s1.code='NJH'
WHERE ts.train_no='D302' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '15:15'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='D302' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'13:00'::time,'15:15'::time,'2 hours 15 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='NJH' JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='D302' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,540,280,37000),
  ('first'::seat_type_enum,165,64,73000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='D302' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';