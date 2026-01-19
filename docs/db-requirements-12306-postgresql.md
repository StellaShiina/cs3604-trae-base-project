# 12306 数据库技术文档（PostgreSQL，Scenario/Given/When/Then）

## 1. 总览
- 目标：支撑 `Home`, `Booking`, `Login`, `Register`, `UserCenter` (Order/Passenger) 等全流程业务。
- 引擎与设置：PostgreSQL 14+；启用扩展 `citext`, `pg_trgm`；时区 `Asia/Shanghai`；字符集 `UTF8`。
- 命名约定：表名小写下划线，主键 `id`，时间 `created_at`, `updated_at`，金额单位 `price_cents`，货币 `currency` 采用 `CNY`。
- 统一类型：采用枚举类型表示列车类型、席别、订单状态、票种等。

## 2. 枚举与扩展
```sql
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE train_type_enum AS ENUM ('G','D','C','Z','T','K');
CREATE TYPE seat_type_enum AS ENUM ('business','first','preferredFirst','second','softSleeper','hardSleeper','hardSeat');
CREATE TYPE ticket_type_enum AS ENUM ('adult','child','student');
CREATE TYPE card_type_enum AS ENUM ('id_card', 'passport', 'other');

-- 预订单状态：活跃、过期、已取消
CREATE TYPE preorder_status_enum AS ENUM ('active','expired','canceled');
-- 订单状态：待支付、已支付、已完成、已取消、已退款、部分退款
CREATE TYPE order_status_enum AS ENUM ('pending_payment', 'paid', 'completed', 'canceled', 'refunded', 'partially_refunded');
-- 车票状态：正常、已退票、已改签
CREATE TYPE ticket_status_enum AS ENUM ('active', 'refunded', 'changed');
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
  id_type card_type_enum,
  id_no TEXT UNIQUE,
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

### 3.2 乘车人管理
```sql
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_type card_type_enum NOT NULL DEFAULT 'id_card',
  card_no TEXT NOT NULL,
  passenger_type ticket_type_enum NOT NULL DEFAULT 'adult',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_no)
);

CREATE INDEX idx_passengers_user ON passengers(user_id);
```

### 3.3 站点与字典
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

### 3.4 列车、服务日、停站、区间与席位库存
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

### 3.5 预订单（库存锁定）
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

### 3.6 订单与车票（核心交易）
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  train_service_id BIGINT NOT NULL REFERENCES train_services(id),
  from_station_id UUID NOT NULL REFERENCES stations(id),
  to_station_id UUID NOT NULL REFERENCES stations(id),
  segment_id BIGINT NOT NULL REFERENCES service_segments(id),
  status order_status_enum NOT NULL DEFAULT 'pending_payment',
  total_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES passengers(id), -- 关联常用乘车人，可选
  passenger_name TEXT NOT NULL,
  passenger_card_type card_type_enum NOT NULL,
  passenger_card_no TEXT NOT NULL,
  seat_type seat_type_enum NOT NULL,
  ticket_type ticket_type_enum NOT NULL DEFAULT 'adult',
  price_cents INTEGER NOT NULL,
  seat_no TEXT, -- 席位号，如 '05A'
  status ticket_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'success',
  payment_method TEXT,
  paid_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_tickets_order ON tickets(order_id);
```

## 4. 约束与触发器
```sql
-- 1. 服务日期限制
CREATE OR REPLACE FUNCTION enforce_service_date_range() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.service_date < current_date OR NEW.service_date > (current_date + INTERVAL '15 days')::date THEN
    RAISE EXCEPTION 'service_date out of range';
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_service_date_range
BEFORE INSERT OR UPDATE OF service_date ON train_services
FOR EACH ROW EXECUTE FUNCTION enforce_service_date_range();

-- 2. 预订单创建时扣减库存
CREATE OR REPLACE FUNCTION decrement_inventory_on_preorder() RETURNS trigger LANGUAGE plpgsql AS $$
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

-- 3. 预订单取消/过期释放库存
CREATE OR REPLACE FUNCTION release_inventory_on_preorder_cancel() RETURNS trigger LANGUAGE plpgsql AS $$
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

-- 4. 出票时扣减库存（实际上预订单已扣减，此处可能是校验或双重保障，视业务逻辑而定，SQL脚本中也有定义）
-- SQL脚本中定义了 decrement_inventory_on_ticket，但通常预订单转订单时不应再次扣减，除非是无预订单直接下单模式。
-- 这里保留SQL脚本中的定义以保持一致性。
CREATE OR REPLACE FUNCTION decrement_inventory_on_ticket() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_segment_id BIGINT;
BEGIN
  SELECT segment_id INTO v_segment_id FROM orders WHERE id = NEW.order_id;
  UPDATE segment_seat_inventory SET left_seats = left_seats - 1
  WHERE segment_id = v_segment_id AND seat_type = NEW.seat_type AND left_seats >= 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not enough seats';
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_ticket_decrement
AFTER INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION decrement_inventory_on_ticket();

-- 5. 订单取消释放库存
CREATE OR REPLACE FUNCTION release_inventory_on_order_cancel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'pending_payment' AND NEW.status = 'canceled' THEN
    UPDATE segment_seat_inventory inv
    SET left_seats = left_seats + 1
    FROM tickets t
    WHERE t.order_id = OLD.id 
      AND t.status = 'active'
      AND inv.segment_id = OLD.segment_id 
      AND inv.seat_type = t.seat_type;
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_order_cancel_release
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION release_inventory_on_order_cancel();

-- 6. 退票释放库存
CREATE OR REPLACE FUNCTION release_inventory_on_ticket_refund() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_segment_id BIGINT;
BEGIN
  IF OLD.status = 'active' AND NEW.status = 'refunded' THEN
    SELECT segment_id INTO v_segment_id FROM orders WHERE id = OLD.order_id;
    UPDATE segment_seat_inventory SET left_seats = left_seats + 1
    WHERE segment_id = v_segment_id AND seat_type = OLD.seat_type;
  END IF;
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_ticket_refund_release
AFTER UPDATE OF status ON tickets
FOR EACH ROW EXECUTE FUNCTION release_inventory_on_ticket_refund();

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

### 5.2 订单查询视图
```sql
CREATE VIEW v_user_orders AS
SELECT 
  o.id AS order_id,
  o.user_id,
  o.train_service_id,
  o.status AS order_status,
  o.total_price_cents,
  o.created_at,
  o.expires_at,
  t.train_no,
  ts.service_date,
  s_from.name_zh AS from_station,
  s_to.name_zh AS to_station,
  seg.depart_time,
  seg.arrive_time,
  jsonb_agg(
    jsonb_build_object(
      'ticket_id', tk.id,
      'passenger_name', tk.passenger_name,
      'seat_type', tk.seat_type,
      'seat_no', tk.seat_no,
      'price', tk.price_cents,
      'status', tk.status
    )
  ) AS tickets
FROM orders o
JOIN train_services ts ON o.train_service_id = ts.id
JOIN trains t ON ts.train_no = t.train_no
JOIN stations s_from ON o.from_station_id = s_from.id
JOIN stations s_to ON o.to_station_id = s_to.id
JOIN service_segments seg ON o.segment_id = seg.id
LEFT JOIN tickets tk ON tk.order_id = o.id
GROUP BY o.id, t.train_no, ts.service_date, s_from.name_zh, s_to.name_zh, seg.depart_time, seg.arrive_time;
```

## 6. 关键场景（数据库视角）
### 6.1 登录查找
- Scenario: 标识符查找用户
  - Given 输入 `Email/Username/Mobile`
  - When 执行 `SELECT` 按 `username`、`email` 或 `mobile`
  - Then 返回用户行，校验成功后写入 `sessions`。

### 6.2 乘车人管理
- Scenario: 添加乘车人
  - Given 用户 ID 与乘车人信息
  - When 插入 `passengers`
  - Then 成功或报唯一性约束错误（同一用户下身份证号重复）。

### 6.3 提交订单（占座）
- Scenario: 用户选择车次与乘车人提交
  - Given 车次信息、乘客列表
  - When 事务开始：
    1. 插入 `orders` (status='pending_payment')
    2. 循环插入 `tickets` -> 触发 `trg_ticket_decrement` 扣减库存
  - Then 成功返回订单 ID，失败（库存不足）回滚。

### 6.4 支付订单
- Scenario: 支付成功回调
  - Given 订单 ID
  - When 更新 `orders` 状态为 `paid`，记录 `paid_at`；插入 `payments` 记录
  - Then 订单状态流转完成。

### 6.5 取消订单
- Scenario: 未支付取消或超时
  - Given 订单 ID (status='pending_payment')
  - When 更新 `orders` 状态为 `canceled`
  - Then 触发 `trg_order_cancel_release`，关联车票库存释放。

### 6.6 退票
- Scenario: 已支付订单某张票退款
  - Given 票 ID
  - When 更新 `tickets` 状态为 `refunded`
  - Then 触发 `trg_ticket_refund_release`，库存释放；应用层计算退款金额。

## 7. 初始化数据（示例）
```sql
INSERT INTO stations(code,name_en,name_zh,pinyin) VALUES
('BJP','Beijing','北京','beijing'),
('SHH','Shanghai','上海','shanghai');

INSERT INTO trains(train_no,train_type) VALUES ('D5','D');
INSERT INTO train_services(train_no,service_date) VALUES ('D5', current_date);

-- 假设 IDs... 插入 Service Stops, Segments, Inventory (参考旧文档，结构未变)
```

## 8. 权限与安全
- `app_rw`: 读写权限，覆盖所有新表（passengers, orders, tickets, payments）。
- `app_ro`: 只读权限。

## 9. 性能与索引建议
- 用户中心：`orders` 表按 `user_id` + `status` 索引，加速“我的订单”列表查询。
- 乘车人：`passengers` 按 `user_id` 索引。
- 支付检查：定期扫描 `expires_at < now() AND status='pending_payment'` 的订单进行批量取消。

## 10. 迁移约定
- 保持向后兼容，初始化脚本需按顺序执行。
