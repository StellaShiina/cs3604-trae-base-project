# 12306 后端技术指南（PostgreSQL 与 API 调用）

## 1. 连接与初始化
- 数据库：PostgreSQL 14+，时区 `Asia/Shanghai`，字符集 `UTF8`
- 初始化脚本：`init-scripts/init.sql`
- 运行示例：
  - `psql -h <host> -U <user> -d <db> -f init-scripts/init.sql`
  - 首次运行会创建扩展、枚举、表、索引、触发器与视图，并插入示例数据（幂等）

## 2. 关键对象概览
- **基础数据**：`stations`, `trains`, `train_services`, `service_stops`, `service_segments`, `segment_seat_inventory`
- **用户中心**：`users`, `sessions`, `passengers`
- **交易核心**：`orders`, `tickets`, `payments`
- **视图**：
  - `v_train_search`：统一返回车次+席位
  - `v_user_orders`：用户订单详情聚合视图（含车票信息）
- **枚举**：`train_type_enum`, `seat_type_enum`, `ticket_type_enum`, `order_status_enum`, `ticket_status_enum`, `card_type_enum`
- **关键触发器**：
  - `trg_ticket_decrement`: 创建车票时扣减库存
  - `trg_order_cancel_release`: 订单取消（未支付）时释放库存
  - `trg_ticket_refund_release`: 退票时释放库存

## 3. 示例数据（执行初始化后可用）
- 站点：`BJP` Beijing(北京)，`SHH` Shanghai(上海)
- 车次：`D5`，服务日为 `current_date`
- 库存：`second` 总 500、剩 120；`first` 总 100、剩 20；`softSleeper` 总 60、剩 10

## 4. 查询与调用方案
### 4.1 基础查询
- **站点检索**（供 Home/Booking 下拉与模糊搜索）：
  - 按 code：`SELECT * FROM stations WHERE code = $1;`
  - 模糊匹配：`SELECT * FROM stations WHERE lower(name_en) ILIKE '%'||lower($1)||'%' OR lower(pinyin) ILIKE '%'||lower($1)||'%' LIMIT 20;`
- **统一车次与余票查询**（供 `/trains/search`）：
  - 视图：`v_train_search`
  - 查询示例：
    ```sql
    SELECT * FROM v_train_search 
    WHERE from_station_id=$1 AND to_station_id=$2 
    AND date=$3 
    AND depart_time BETWEEN $4 AND $5 
    ORDER BY depart_time 
    LIMIT $6 OFFSET $7;
    ```

### 4.2 用户与乘车人
- **乘车人管理**：
  - 列表：`SELECT * FROM passengers WHERE user_id=$1;`
  - 新增：`INSERT INTO passengers(user_id, name, card_type, card_no, passenger_type) VALUES (...)`
  - 删除：`DELETE FROM passengers WHERE id=$1 AND user_id=$2;`

### 4.3 核心交易流程
#### 1. 提交订单（下单占座）
- **API**: `POST /api/v1/orders`
- **逻辑**：
  1. 开启事务。
  2. 插入 `orders` 表，状态默认为 `pending_payment`，过期时间设为 15-30 分钟后。
  3. 遍历乘车人列表，逐条插入 `tickets` 表。
     - **注意**：`tickets` 插入会触发 `trg_ticket_decrement`。若库存不足，DB 抛出异常，应用层捕获后回滚事务并返回 `409 Conflict (Not enough seats)`。
  4. 提交事务，返回 `order_id`。

#### 2. 支付订单
- **API**: `POST /api/v1/orders/{id}/pay` (或回调)
- **逻辑**：
  1. 校验订单状态是否为 `pending_payment` 且未过期。
  2. 模拟/调用支付网关。
  3. 成功后：
     - 更新 `orders` SET `status='paid'`, `paid_at=now()`
     - 插入 `payments` 记录流水。
     - 返回成功。

#### 3. 取消订单（未支付）
- **API**: `POST /api/v1/orders/{id}/cancel`
- **逻辑**：
  - 执行 `UPDATE orders SET status='canceled' WHERE id=$1 AND user_id=$2 AND status='pending_payment'`。
  - DB 触发器 `trg_order_cancel_release` 自动释放库存。

#### 4. 退票（已支付）
- **API**: `POST /api/v1/tickets/{id}/refund`
- **逻辑**：
  - 校验车票归属及状态（必须为 `active` 且订单已支付）。
  - 计算退票费率（应用层逻辑）。
  - 执行 `UPDATE tickets SET status='refunded' WHERE id=$1`。
  - DB 触发器 `trg_ticket_refund_release` 自动释放库存。
  - 记录退款流水（可选，视 `payments` 表扩展情况）。

#### 5. 订单查询
- **API**: `GET /api/v1/orders`
- **逻辑**：
  - 查询 `v_user_orders` 视图。
  - 支持按状态筛选：`WHERE user_id=$1 AND order_status=$2`。

## 5. API 对应关系（后端参考）
| 方法 | 路径 | 描述 | DB 操作 |
| --- | --- | --- | --- |
| POST | `/auth/login` | 登录 | 查 `users`，插 `sessions` |
| GET | `/passengers` | 获取乘车人 | Select `passengers` |
| POST | `/passengers` | 添加乘车人 | Insert `passengers` |
| GET | `/trains/search` | 车次查询 | Select `v_train_search` |
| POST | `/orders` | 提交订单 | Tx: Insert `orders` + `tickets` |
| GET | `/orders` | 订单列表 | Select `v_user_orders` |
| GET | `/orders/:id` | 订单详情 | Select `v_user_orders` |
| POST | `/orders/:id/cancel` | 取消订单 | Update `orders` |
| POST | `/orders/:id/pay` | 支付订单 | Update `orders`, Insert `payments` |
| POST | `/tickets/:id/refund` | 退票 | Update `tickets` |

## 6. 约束与错误处理
- **余票不足**：捕获 `not enough seats` 异常，返回前端友好提示。
- **重复购票**：`passengers` 表有 `(user_id, card_no)` 唯一约束；业务层可校验同一车次同一身份证号是否已购票（需查 `tickets` 关联 `orders`）。
- **超时取消**：建议编写后台定时任务（Cron Job），每分钟扫描 `orders` 表：
  ```sql
  UPDATE orders SET status='canceled' 
  WHERE status='pending_payment' AND expires_at < now();
  ```
  该操作会自动触发库存释放。

## 7. 运维与权限
- 生产环境建议分离 `app_rw`（读写）与 `app_ro`（只读/报表）账号。
- 定期对 `orders` 和 `tickets` 表进行分区（按月/年），以应对数据量增长。
