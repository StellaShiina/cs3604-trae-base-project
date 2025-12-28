-- Hong Kong West Kowloon (HKG) <-> Shanghai (SHH)
-- Trains: G99 (SHH->HKG), G102 (HKG->SHH), G103 (SHH->HKG), G104 (HKG->SHH)
-- Route: HKG <-> SZH <-> GZQ <-> HZH <-> SHH

-- 1. Insert Train Services (16 days rolling)
INSERT INTO train_services(train_no, service_date)
SELECT t.train_no, d::date
FROM trains t
JOIN generate_series(current_date, current_date + INTERVAL '15 days', INTERVAL '1 day') AS d ON true
WHERE t.train_no IN ('G99', 'G102', 'G103', 'G104')
AND NOT EXISTS (
  SELECT 1 FROM train_services ts WHERE ts.train_no = t.train_no AND ts.service_date = d::date
);

-- 2. Define Stops for G102 (HKG -> SHH)
-- Stops: 1.HKG(11:00) -> 2.SZH(11:18/11:23) -> 3.GZQ(11:53/11:58) -> 4.HZH(18:30/18:35) -> 5.SHH(19:30)
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 1, NULL, '11:00'::time FROM train_services ts JOIN stations s ON s.code='HKG' WHERE ts.train_no='G102' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 2, '11:18'::time, '11:23'::time FROM train_services ts JOIN stations s ON s.code='SZH' WHERE ts.train_no='G102' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 3, '11:53'::time, '11:58'::time FROM train_services ts JOIN stations s ON s.code='GZQ' WHERE ts.train_no='G102' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 4, '18:30'::time, '18:35'::time FROM train_services ts JOIN stations s ON s.code='HZH' WHERE ts.train_no='G102' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 5, '19:30'::time, NULL FROM train_services ts JOIN stations s ON s.code='SHH' WHERE ts.train_no='G102' ON CONFLICT DO NOTHING;

-- 3. Define Stops for G104 (HKG -> SHH) - A bit later
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 1, NULL, '13:00'::time FROM train_services ts JOIN stations s ON s.code='HKG' WHERE ts.train_no='G104' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 2, '13:18'::time, '13:23'::time FROM train_services ts JOIN stations s ON s.code='SZH' WHERE ts.train_no='G104' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 3, '13:53'::time, '13:58'::time FROM train_services ts JOIN stations s ON s.code='GZQ' WHERE ts.train_no='G104' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 4, '20:30'::time, '20:35'::time FROM train_services ts JOIN stations s ON s.code='HZH' WHERE ts.train_no='G104' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 5, '21:30'::time, NULL FROM train_services ts JOIN stations s ON s.code='SHH' WHERE ts.train_no='G104' ON CONFLICT DO NOTHING;

-- 4. Define Stops for G99 (SHH -> HKG)
-- Reverse order: SHH(14:10) -> HZH(15:00/15:05) -> GZQ(21:40/21:45) -> SZH(22:15/22:20) -> HKG(22:38)
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 1, NULL, '14:10'::time FROM train_services ts JOIN stations s ON s.code='SHH' WHERE ts.train_no='G99' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 2, '15:00'::time, '15:05'::time FROM train_services ts JOIN stations s ON s.code='HZH' WHERE ts.train_no='G99' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 3, '21:40'::time, '21:45'::time FROM train_services ts JOIN stations s ON s.code='GZQ' WHERE ts.train_no='G99' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 4, '22:15'::time, '22:20'::time FROM train_services ts JOIN stations s ON s.code='SZH' WHERE ts.train_no='G99' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 5, '22:38'::time, NULL FROM train_services ts JOIN stations s ON s.code='HKG' WHERE ts.train_no='G99' ON CONFLICT DO NOTHING;

-- 5. Define Stops for G103 (SHH -> HKG)
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 1, NULL, '08:00'::time FROM train_services ts JOIN stations s ON s.code='SHH' WHERE ts.train_no='G103' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 2, '08:50'::time, '08:55'::time FROM train_services ts JOIN stations s ON s.code='HZH' WHERE ts.train_no='G103' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 3, '15:30'::time, '15:35'::time FROM train_services ts JOIN stations s ON s.code='GZQ' WHERE ts.train_no='G103' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 4, '16:05'::time, '16:10'::time FROM train_services ts JOIN stations s ON s.code='SZH' WHERE ts.train_no='G103' ON CONFLICT DO NOTHING;
INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
SELECT ts.id, s.id, 5, '16:28'::time, NULL FROM train_services ts JOIN stations s ON s.code='HKG' WHERE ts.train_no='G103' ON CONFLICT DO NOTHING;

-- 6. Generate All Segments (Permutations) for these trains
-- Logic: For each train service, join stops s1 and s2 where s1.seq < s2.seq
INSERT INTO service_segments(train_service_id, from_stop_seq, to_stop_seq, from_station_id, to_station_id, depart_time, arrive_time, duration)
SELECT 
  ts.id,
  s1.stop_seq,
  s2.stop_seq,
  s1.station_id,
  s2.station_id,
  s1.depart_time,
  s2.arrival_time,
  (s2.arrival_time - s1.depart_time)::interval
FROM train_services ts
JOIN service_stops s1 ON s1.train_service_id = ts.id
JOIN service_stops s2 ON s2.train_service_id = ts.id
WHERE ts.train_no IN ('G99', 'G102', 'G103', 'G104')
AND s1.stop_seq < s2.stop_seq
AND NOT EXISTS (
  SELECT 1 FROM service_segments seg 
  WHERE seg.train_service_id = ts.id 
  AND seg.from_stop_seq = s1.stop_seq 
  AND seg.to_stop_seq = s2.stop_seq
);

-- 7. Initialize Inventory for All Segments
-- Assuming standardized capacity for these trains
-- Second Class: 500, First: 100, Business: 30
-- Prices should ideally vary by distance, but for simplicity we set base price + distance factor or fixed.
-- Here we use a simplified pricing logic: Base 100 RMB + 50 RMB per stop diff * multiplier?
-- Or just hardcode for simplicity of the seed.
-- We can use a randomized or calculated approach in the INSERT.

INSERT INTO segment_seat_inventory(train_service_id, segment_id, seat_type, total_seats, left_seats, price_cents)
SELECT 
  seg.train_service_id,
  seg.id,
  st.type,
  st.total,
  st.total, -- Start full
  (10000 + (seg.to_stop_seq - seg.from_stop_seq) * st.price_step) -- Simplified price calculation
FROM service_segments seg
JOIN train_services ts ON seg.train_service_id = ts.id
CROSS JOIN (
  VALUES 
    ('second'::seat_type_enum, 500, 15000), -- Base ~150 RMB per hop
    ('first'::seat_type_enum, 100, 25000),
    ('business'::seat_type_enum, 30, 50000)
) AS st(type, total, price_step)
WHERE ts.train_no IN ('G99', 'G102', 'G103', 'G104')
ON CONFLICT (train_service_id, segment_id, seat_type) DO NOTHING;
