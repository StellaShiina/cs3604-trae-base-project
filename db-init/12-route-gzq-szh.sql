-- Guangzhou (GZQ) -> Shenzhen (SZH)
INSERT INTO train_services(train_no,service_date)
SELECT t.train_no, d::date FROM trains t
JOIN generate_series(current_date, current_date + INTERVAL '13 days', INTERVAL '1 day') AS d ON true
WHERE t.train_no IN ('G100','G101','G201')
AND NOT EXISTS (
  SELECT 1 FROM train_services ts WHERE ts.train_no = t.train_no AND ts.service_date = d::date
);

-- G100 10:00-10:40
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '10:00'::time FROM train_services ts JOIN stations s1 ON s1.code='GZQ'
WHERE ts.train_no='G100' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '10:40'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='SZH'
WHERE ts.train_no='G100' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'10:00'::time,'10:40'::time,'40 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='GZQ' JOIN stations s2 ON s2.code='SZH'
WHERE ts.train_no='G100' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,700,340,25000),
  ('first'::seat_type_enum,180,70,48000),
  ('business'::seat_type_enum,40,20,90000)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='G100' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- G101 10:20-11:00（新增班次）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '10:20'::time FROM train_services ts JOIN stations s1 ON s1.code='GZQ'
WHERE ts.train_no='G101' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '11:00'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='SZH'
WHERE ts.train_no='G101' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'10:20'::time,'11:00'::time,'40 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='GZQ' JOIN stations s2 ON s2.code='SZH'
WHERE ts.train_no='G101' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,720,360,25500),
  ('first'::seat_type_enum,190,75,48500),
  ('business'::seat_type_enum,42,21,90500)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='G101' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';

-- G201 09:40-10:20（新增班次）
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s1.id, 1, NULL, '09:40'::time FROM train_services ts JOIN stations s1 ON s1.code='GZQ'
WHERE ts.train_no='G201' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s2.id, 2, '10:20'::time, NULL FROM train_services ts JOIN stations s2 ON s2.code='SZH'
WHERE ts.train_no='G201' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date ON CONFLICT (train_service_id,stop_seq) DO NOTHING;
INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2,s1.id,s2.id,'09:40'::time,'10:20'::time,'40 minutes'::interval
FROM train_services ts JOIN stations s1 ON s1.code='GZQ' JOIN stations s2 ON s2.code='SZH'
WHERE ts.train_no='G201' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date AND NOT EXISTS(
  SELECT 1 FROM service_segments seg WHERE seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2);
INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left_qty, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id=ts.id AND seg.from_stop_seq=1 AND seg.to_stop_seq=2
JOIN (VALUES
  ('second'::seat_type_enum,690,350,24800),
  ('first'::seat_type_enum,170,68,47800),
  ('business'::seat_type_enum,38,19,89500)
) AS x(seat_type,total,left_qty,price) ON true
WHERE ts.train_no='G201' AND ts.service_date BETWEEN current_date AND (current_date + INTERVAL '13 days')::date
ON CONFLICT (train_service_id,segment_id,seat_type) DO UPDATE SET total_seats=EXCLUDED.total_seats,left_seats=EXCLUDED.left_seats,price_cents=EXCLUDED.price_cents,currency='CNY';