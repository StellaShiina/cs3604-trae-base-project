-- Shanghai (SHH) -> Hangzhou (HZH)
INSERT INTO train_services(train_no,service_date)
SELECT t.train_no, d::date FROM trains t
JOIN generate_series(current_date, current_date + INTERVAL '13 days', INTERVAL '1 day') AS d ON true
WHERE t.train_no IN ('C1','C2')
AND NOT EXISTS (
  SELECT 1 FROM train_services ts WHERE ts.train_no = t.train_no AND ts.service_date = d::date
);

-- C1 08:00-09:00
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '08:00'::time FROM train_services ts JOIN stations s1 ON s1.code='SHH'
WHERE ts.train_no='C1' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '09:00'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='C1' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'08:00'::time,'09:00'::time,'1 hour'::interval
FROM train_services ts JOIN stations s1 ON s1.code='SHH' JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='C1' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,500,260,32000),
  ('first'::seat_type_enum,120,50,60000),
  ('business'::seat_type_enum,30,15,120000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='C1' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- C2 09:30-10:30（新增班次）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '09:30'::time FROM train_services ts JOIN stations s1 ON s1.code='SHH'
WHERE ts.train_no='C2' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '10:30'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='C2' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'09:30'::time,'10:30'::time,'1 hour'::interval
FROM train_services ts JOIN stations s1 ON s1.code='SHH' JOIN stations s2 ON s2.code='HZH'
WHERE ts.train_no='C2' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,520,280,33000),
  ('first'::seat_type_enum,130,55,61000),
  ('business'::seat_type_enum,35,18,121000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='C2' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';