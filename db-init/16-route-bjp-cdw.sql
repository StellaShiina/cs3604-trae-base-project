-- Beijing (BJP) -> Chengdu (CDW)
-- Generate services for next 14 days and populate stops, segments, and inventory.

-- Insert train services for 14 days for selected trains
INSERT INTO train_services(train_no,service_date)
SELECT t.train_no, d::date FROM trains t
JOIN generate_series(current_date, current_date + INTERVAL '13 days', INTERVAL '1 day') AS d ON true
WHERE t.train_no IN ('G301','G303','D701','Z151')
AND NOT EXISTS (
  SELECT 1 FROM train_services ts WHERE ts.train_no = t.train_no AND ts.service_date = d::date
);

-- Define timetable and inventory for each train (direct 2-stop for demo)

-- G301 07:10-15:30
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '07:10'::time FROM train_services ts JOIN stations s1 ON s1.code='BJP'
WHERE ts.train_no='G301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '15:30'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='G301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'07:10'::time,'15:30'::time,'8 hours 20 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='BJP' JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='G301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.total, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,700,700,88000),
  ('first'::seat_type_enum,180,180,146000),
  ('business'::seat_type_enum,40,40,269000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='G301' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- G303 08:20-16:40
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '08:20'::time FROM train_services ts JOIN stations s1 ON s1.code='BJP'
WHERE ts.train_no='G303' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '16:40'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='G303' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'08:20'::time,'16:40'::time,'8 hours 20 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='BJP' JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='G303' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.total, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,720,720,89000),
  ('first'::seat_type_enum,190,190,148000),
  ('business'::seat_type_enum,45,45,271000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='G303' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- D701 09:00-18:30（普通动车，价格更低）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '09:00'::time FROM train_services ts JOIN stations s1 ON s1.code='BJP'
WHERE ts.train_no='D701' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '18:30'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='D701' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'09:00'::time,'18:30'::time,'9 hours 30 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='BJP' JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='D701' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.total, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,650,650,68000),
  ('first'::seat_type_enum,150,150,116000),
  ('softSleeper'::seat_type_enum,80,80,159000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='D701' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- Z151 20:20-07:40（直达特快，含卧铺）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '20:20'::time FROM train_services ts JOIN stations s1 ON s1.code='BJP'
WHERE ts.train_no='Z151' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '07:40'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='Z151' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'20:20'::time,'07:40'::time,'11 hours 20 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='BJP' JOIN stations s2 ON s2.code='CDW'
WHERE ts.train_no='Z151' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.total, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('hardSeat'::seat_type_enum,500,500,38000),
  ('hardSleeper'::seat_type_enum,260,260,82000),
  ('softSleeper'::seat_type_enum,120,120,138000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='Z151' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';