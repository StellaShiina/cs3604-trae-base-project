-- 12306 English UI Database Init (PostgreSQL)
-- Schema, enums, extensions, seed data aligning with:
-- - db-requirements-12306-postgresql.md
-- - api-requirements-12306-en.md

-- Extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
    CREATE TYPE gender_enum AS ENUM ('male','female');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'train_type_enum') THEN
    CREATE TYPE train_type_enum AS ENUM ('G','D','C','Z','T','K');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seat_type_enum') THEN
    CREATE TYPE seat_type_enum AS ENUM ('business','first','second','softSleeper','hardSleeper','hardSeat');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_type_enum') THEN
    CREATE TYPE ticket_type_enum AS ENUM ('adult','child','student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'preorder_status_enum') THEN
    CREATE TYPE preorder_status_enum AS ENUM ('active','expired','canceled');
  END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE,
  mobile CITEXT UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  nationality TEXT,
  passport_number TEXT,
  passport_expiration_date DATE,
  date_of_birth DATE,
  gender gender_enum,
  status TEXT DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  sid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip INET
);

CREATE INDEX IF NOT EXISTS idx_users_login_lookup ON users USING BTREE (username, email, mobile);

CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  city_en TEXT,
  city_zh TEXT,
  pinyin TEXT
);

CREATE INDEX IF NOT EXISTS idx_stations_code ON stations(code);
CREATE INDEX IF NOT EXISTS idx_stations_name_en_trgm ON stations USING GIN (lower(name_en) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stations_pinyin_trgm ON stations USING GIN (lower(pinyin) gin_trgm_ops);

CREATE TABLE IF NOT EXISTS trains (
  train_no TEXT PRIMARY KEY,
  train_type train_type_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS train_services (
  id BIGSERIAL PRIMARY KEY,
  train_no TEXT NOT NULL REFERENCES trains(train_no) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_stops (
  id BIGSERIAL PRIMARY KEY,
  train_service_id BIGINT NOT NULL REFERENCES train_services(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id),
  stop_seq INTEGER NOT NULL,
  arrival_time TIME,
  depart_time TIME,
  UNIQUE(train_service_id, stop_seq)
);

CREATE TABLE IF NOT EXISTS service_segments (
  id BIGSERIAL PRIMARY KEY,
  train_service_id BIGINT NOT NULL REFERENCES train_services(id) ON DELETE CASCADE,
  from_stop_seq INTEGER NOT NULL,
  to_stop_seq INTEGER NOT NULL,
  from_station_id UUID NOT NULL REFERENCES stations(id),
  to_station_id UUID NOT NULL REFERENCES stations(id),
  depart_time TIME NOT NULL,
  arrive_time TIME NOT NULL,
  duration INTERVAL NOT NULL
);

CREATE TABLE IF NOT EXISTS segment_seat_inventory (
  id BIGSERIAL PRIMARY KEY,
  train_service_id BIGINT NOT NULL REFERENCES train_services(id) ON DELETE CASCADE,
  segment_id BIGINT NOT NULL REFERENCES service_segments(id) ON DELETE CASCADE,
  seat_type seat_type_enum NOT NULL,
  total_seats INTEGER NOT NULL,
  left_seats INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  UNIQUE(train_service_id, segment_id, seat_type)
);

CREATE INDEX IF NOT EXISTS idx_train_services_date ON train_services(service_date);
CREATE INDEX IF NOT EXISTS idx_segments_pair ON service_segments(train_service_id, from_station_id, to_station_id);
CREATE INDEX IF NOT EXISTS idx_segments_depart_time ON service_segments(depart_time);
CREATE INDEX IF NOT EXISTS idx_inv_segment_seat ON segment_seat_inventory(segment_id, seat_type);

CREATE TABLE IF NOT EXISTS preorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  train_service_id BIGINT NOT NULL REFERENCES train_services(id) ON DELETE CASCADE,
  from_station_id UUID NOT NULL REFERENCES stations(id),
  to_station_id UUID NOT NULL REFERENCES stations(id),
  segment_id BIGINT NOT NULL REFERENCES service_segments(id) ON DELETE CASCADE,
  seat_type seat_type_enum NOT NULL,
  hold_quantity INTEGER NOT NULL DEFAULT 1,
  status preorder_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_preorders_active ON preorders(status, expires_at);

-- Triggers: 14-day range enforcement for service_date
CREATE OR REPLACE FUNCTION enforce_service_date_range() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.service_date < current_date OR NEW.service_date > (current_date + INTERVAL '14 days')::date THEN
    RAISE EXCEPTION 'service_date out of range';
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_service_date_range ON train_services;
CREATE TRIGGER trg_service_date_range
BEFORE INSERT OR UPDATE OF service_date ON train_services
FOR EACH ROW EXECUTE FUNCTION enforce_service_date_range();

-- Triggers: inventory decrement on preorder create
CREATE OR REPLACE FUNCTION decrement_inventory_on_preorder() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE segment_seat_inventory SET left_seats = left_seats - NEW.hold_quantity
  WHERE segment_id = NEW.segment_id AND seat_type = NEW.seat_type AND left_seats >= NEW.hold_quantity;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not enough seats';
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_preorder_decrement ON preorders;
CREATE TRIGGER trg_preorder_decrement
AFTER INSERT ON preorders
FOR EACH ROW EXECUTE FUNCTION decrement_inventory_on_preorder();

-- Triggers: inventory release on preorder cancel/expire
CREATE OR REPLACE FUNCTION release_inventory_on_preorder_cancel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status IN ('canceled','expired') THEN
    UPDATE segment_seat_inventory SET left_seats = left_seats + OLD.hold_quantity
    WHERE segment_id = OLD.segment_id AND seat_type = OLD.seat_type;
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_preorder_release ON preorders;
CREATE TRIGGER trg_preorder_release
AFTER UPDATE OF status ON preorders
FOR EACH ROW EXECUTE FUNCTION release_inventory_on_preorder_cancel();

-- View: consolidated search result for /trains/search
CREATE OR REPLACE VIEW v_train_search AS
SELECT
  ts.id AS train_service_id,
  t.train_no,
  t.train_type,
  seg.id AS segment_id,
  seg.from_station_id,
  seg.to_station_id,
  seg.depart_time,
  seg.arrive_time,
  seg.duration,
  ts.service_date AS date,
  EXISTS(
    SELECT 1 FROM segment_seat_inventory inv2
    WHERE inv2.segment_id = seg.id AND inv2.left_seats > 0
  ) AS bookable,
  jsonb_agg(
    jsonb_build_object(
      'type', inv.seat_type,
      'price', inv.price_cents,
      'left', inv.left_seats,
      'currency', inv.currency,
      'bookable', (inv.left_seats > 0)
    ) ORDER BY inv.seat_type
  ) AS seats
FROM train_services ts
JOIN trains t ON t.train_no = ts.train_no
JOIN service_segments seg ON seg.train_service_id = ts.id
JOIN segment_seat_inventory inv ON inv.segment_id = seg.id
GROUP BY ts.id, t.train_no, t.train_type, seg.id, seg.from_station_id, seg.to_station_id, seg.depart_time, seg.arrive_time, seg.duration;

CREATE OR REPLACE FUNCTION clone_train_service_for_date(p_train_no TEXT, p_source_date DATE, p_target_date DATE) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  src_id BIGINT;
  tgt_id BIGINT;
BEGIN
  SELECT id INTO src_id FROM train_services WHERE train_no = p_train_no AND service_date = p_source_date LIMIT 1;
  IF src_id IS NULL THEN RETURN; END IF;
  SELECT id INTO tgt_id FROM train_services WHERE train_no = p_train_no AND service_date = p_target_date LIMIT 1;
  IF tgt_id IS NULL THEN
    INSERT INTO train_services(train_no, service_date) VALUES (p_train_no, p_target_date) RETURNING id INTO tgt_id;
  END IF;

  INSERT INTO service_stops(train_service_id, station_id, stop_seq, arrival_time, depart_time)
  SELECT tgt_id, s.station_id, s.stop_seq, s.arrival_time, s.depart_time
  FROM service_stops s WHERE s.train_service_id = src_id
  ON CONFLICT (train_service_id, stop_seq) DO NOTHING;

  INSERT INTO service_segments(train_service_id, from_stop_seq, to_stop_seq, from_station_id, to_station_id, depart_time, arrive_time, duration)
  SELECT tgt_id, seg.from_stop_seq, seg.to_stop_seq, seg.from_station_id, seg.to_station_id, seg.depart_time, seg.arrive_time, seg.duration
  FROM service_segments seg WHERE seg.train_service_id = src_id
  AND NOT EXISTS (
    SELECT 1 FROM service_segments seg2 WHERE seg2.train_service_id = tgt_id AND seg2.from_stop_seq = seg.from_stop_seq AND seg2.to_stop_seq = seg.to_stop_seq
  );

  INSERT INTO segment_seat_inventory(train_service_id, segment_id, seat_type, total_seats, left_seats, price_cents)
  SELECT tgt_id, tgt_seg.id, inv.seat_type, inv.total_seats, inv.total_seats, inv.price_cents
  FROM segment_seat_inventory inv
  JOIN service_segments src_seg ON src_seg.id = inv.segment_id AND src_seg.train_service_id = src_id
  JOIN service_segments tgt_seg ON tgt_seg.train_service_id = tgt_id AND tgt_seg.from_stop_seq = src_seg.from_stop_seq AND tgt_seg.to_stop_seq = src_seg.to_stop_seq
  ON CONFLICT (train_service_id, segment_id, seat_type)
  DO UPDATE SET total_seats = EXCLUDED.total_seats, left_seats = EXCLUDED.left_seats, price_cents = EXCLUDED.price_cents, currency='CNY';
END;$$;

CREATE OR REPLACE FUNCTION ensure_rolling_14_days() RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  tr RECORD;
  i INTEGER;
BEGIN
  DELETE FROM train_services WHERE service_date < current_date;
  FOR tr IN SELECT DISTINCT train_no FROM train_services WHERE service_date = current_date LOOP
    FOR i IN 1..13 LOOP
      PERFORM clone_train_service_for_date(tr.train_no, current_date, (current_date + i));
    END LOOP;
  END LOOP;
END;$$;