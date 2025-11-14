# 12306 英文版数据库技术文档（PostgreSQL，Scenario/Given/When/Then）

## 1. 总览
- 目标：支撑 `Home`、`Booking`、`Login`、`Register` 四页面及对应 API 正常运行。
- 引擎与设置：PostgreSQL 14+；启用扩展 `citext`、`pg_trgm`；时区 `Asia/Shanghai`；字符集 `UTF8`。
- 命名约定：表名小写下划线，主键 `id`，时间 `created_at`、`updated_at`，金额单位 `price_cents`，货币 `currency` 采用 `CNY`。
- 统一类型：采用枚举类型表示列车类型、席别、性别、预订占位状态、票种。

## 2. 枚举与扩展
```sql
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE gender_enum AS ENUM ('male','female');
CREATE TYPE train_type_enum AS ENUM ('G','D','C','Z','T','K');
CREATE TYPE seat_type_enum AS ENUM ('business','first','second','softSleeper','hardSleeper','hardSeat');
CREATE TYPE ticket_type_enum AS ENUM ('adult','child','student');
CREATE TYPE preorder_status_enum AS ENUM ('active','expired','canceled');
```

## 3. 表结构
### 3.1 用户与会话
```sql
CREATE TABLE users (
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

CREATE TABLE sessions (
  sid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip INET
);

CREATE INDEX idx_users_login_lookup ON users USING BTREE (username, email, mobile);
```

### 3.2 站点与字典
```sql
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  city_en TEXT,
  city_zh TEXT,
  pinyin TEXT
);

CREATE INDEX idx_stations_code ON stations(code);
CREATE INDEX idx_stations_name_en_trgm ON stations USING GIN (lower(name_en) gin_trgm_ops);
CREATE INDEX idx_stations_pinyin_trgm ON stations USING GIN (lower(pinyin) gin_trgm_ops);
```

### 3.3 列车、服务日、停站、区间与席位库存
```sql
CREATE TABLE trains (
  train_no TEXT PRIMARY KEY,
  train_type train_type_enum NOT NULL
);

CREATE TABLE train_services (
  id BIGSERIAL PRIMARY KEY,
  train_no TEXT NOT NULL REFERENCES trains(train_no) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_stops (
  id BIGSERIAL PRIMARY KEY,
  train_service_id BIGINT NOT NULL REFERENCES train_services(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id),
  stop_seq INTEGER NOT NULL,
  arrival_time TIME,
  depart_time TIME,
  UNIQUE(train_service_id, stop_seq)
);

CREATE TABLE service_segments (
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

CREATE TABLE segment_seat_inventory (
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

CREATE INDEX idx_train_services_date ON train_services(service_date);
CREATE INDEX idx_segments_pair ON service_segments(train_service_id, from_station_id, to_station_id);
CREATE INDEX idx_segments_depart_time ON service_segments(depart_time);
CREATE INDEX idx_inv_segment_seat ON segment_seat_inventory(segment_id, seat_type);
```

### 3.4 预订占位（支持按钮联动）
```sql
CREATE TABLE preorders (
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

CREATE INDEX idx_preorders_active ON preorders(status, expires_at);
```

## 4. 约束与触发器
```sql
CREATE FUNCTION enforce_service_date_range() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.service_date < current_date OR NEW.service_date > (current_date + INTERVAL '14 days')::date THEN
    RAISE EXCEPTION 'service_date out of range';
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_service_date_range
BEFORE INSERT OR UPDATE OF service_date ON train_services
FOR EACH ROW EXECUTE FUNCTION enforce_service_date_range();

CREATE FUNCTION decrement_inventory_on_preorder() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE segment_seat_inventory SET left_seats = left_seats - NEW.hold_quantity
  WHERE segment_id = NEW.segment_id AND seat_type = NEW.seat_type AND left_seats >= NEW.hold_quantity;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not enough seats';
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_preorder_decrement
AFTER INSERT ON preorders
FOR EACH ROW EXECUTE FUNCTION decrement_inventory_on_preorder();

CREATE FUNCTION release_inventory_on_preorder_cancel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status IN ('canceled','expired') THEN
    UPDATE segment_seat_inventory SET left_seats = left_seats + OLD.hold_quantity
    WHERE segment_id = OLD.segment_id AND seat_type = OLD.seat_type;
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_preorder_release
AFTER UPDATE OF status ON preorders
FOR EACH ROW EXECUTE FUNCTION release_inventory_on_preorder_cancel();
```

## 5. 视图与查询
### 5.1 统一查询视图（供 `/trains/search`）
```sql
CREATE VIEW v_train_search AS
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
```

### 5.2 典型查询示例
```sql
SELECT * FROM v_train_search
WHERE from_station_id = $1 AND to_station_id = $2
AND date = $3
AND depart_time BETWEEN $4 AND $5
AND train_type = ANY($6)
ORDER BY depart_time ASC
LIMIT $7 OFFSET $8;
```

## 6. 关键场景（数据库视角）
### 6.1 登录查找
- Scenario: 标识符查找用户
  - Given 输入 `Email/Username/Mobile`
  - When 执行 `SELECT` 按 `username`、`email` 或 `mobile`
  - Then 返回用户行与 `password_hash`，校验成功后写入 `sessions` 并返回 `sid`。

### 6.2 站点模糊搜索
- Scenario: 模糊匹配 `q=bei`
  - Given 关键词 `bei`
  - When 查询 `stations` 使用 `pg_trgm` 索引匹配 `name_en` 或 `pinyin`
  - Then 返回最多 20 条匹配项用于下拉选择。

### 6.3 余票查询
- Scenario: 查询北京→上海
  - Given `from_station_id`、`to_station_id`、`date`
  - When 读取 `v_train_search` 按区间与日期过滤，支持 `train_type` 与时间段
  - Then 返回车次、时刻、席位价格与 `left`，`bookable` 基于 `left_seats>0`。

### 6.4 创建预订占位
- Scenario: 已登录点击 `Book`
  - Given 可订席位
  - When 插入 `preorders` 并触发扣减库存
  - Then 返回 `preorderId` 与 `expires_at`；后续流程继续。

### 6.5 过期与取消释放
- Scenario: 占位过期或用户取消
  - Given `status` 更新至 `expired` 或 `canceled`
  - When 触发释放库存
  - Then 对应 `segment_seat_inventory.left_seats` 回增。

## 7. 初始化数据（示例）
```sql
INSERT INTO stations(code,name_en,name_zh,pinyin) VALUES
('BJP','Beijing','北京','beijing'),
('SHH','Shanghai','上海','shanghai');

INSERT INTO trains(train_no,train_type) VALUES
('D5','D');

INSERT INTO train_services(train_no,service_date) VALUES
('D5', current_date);

INSERT INTO service_stops(train_service_id,station_id,stop_seq,arrival_time,depart_time)
SELECT ts.id, s.id, x.stop_seq, x.arrival_time, x.depart_time
FROM train_services ts
JOIN stations s ON s.code IN ('BJP','SHH')
JOIN (VALUES (1,NULL,'07:21'::time),(2,'09:27'::time,'09:30'::time)) AS x(stop_seq,arrival_time,depart_time) ON true;

INSERT INTO service_segments(train_service_id,from_stop_seq,to_stop_seq,from_station_id,to_station_id,depart_time,arrive_time,duration)
SELECT ts.id,1,2, s1.id, s2.id, '07:21'::time, '09:27'::time, '2 hours 6 minutes'::interval
FROM train_services ts
JOIN stations s1 ON s1.code = 'BJP'
JOIN stations s2 ON s2.code = 'SHH';

INSERT INTO segment_seat_inventory(train_service_id,segment_id,seat_type,total_seats,left_seats,price_cents)
SELECT ts.id, seg.id, x.seat_type, x.total, x.left, x.price
FROM train_services ts
JOIN service_segments seg ON seg.train_service_id = ts.id
JOIN (VALUES
('second', 500, 120, 31800),
('first', 100, 20, 62600),
('softSleeper', 60, 10, 94700)
) AS x(seat_type,total,left,price) ON true;
```

## 8. 权限与安全
```sql
CREATE ROLE app_admin;
CREATE ROLE app_rw;
CREATE ROLE app_ro;
GRANT USAGE ON SCHEMA public TO app_ro, app_rw, app_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_ro;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT app_rw, app_ro TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
```

## 9. 性能与索引建议
- 登录查找：`users` 采用 `citext`，避免大小写问题；组合索引提升三字段并查。
- 站点搜索：`pg_trgm` GIN 索引加速模糊匹配；必要时建立中文名索引。
- 余票查询：日期、区间与出发时段索引组合；`v_train_search` 作为只读视图供 API 层使用。
- 座位库存：`segment_id+seat_type` 唯一约束，避免重复记录；扣减与释放由触发器保证原子性。

## 10. 迁移约定
- 文件命名：`YYYYMMDDHHMM__<feature>.sql`；每次迁移只做一种职责的变更。
- 回滚策略：与迁移文件成对提供 `down` 语句；初始化数据独立迁移编排。

## 11. 未来扩展占位
- 订单与支付：基于 `preorders` 生成 `orders` 与 `payments` 表，记录座位分配、状态机与支付流水。
- 乘车人：`passengers` 与用户关联，支持 15 人上限与核验状态字段。
- 改签与退票：订单状态变更记录表与库存返还策略。

