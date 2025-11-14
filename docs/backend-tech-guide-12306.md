# 12306 英文版后端技术指南（PostgreSQL 与 API 调用）

## 1. 连接与初始化
- 数据库：PostgreSQL 14+，时区 `Asia/Shanghai`，字符集 `UTF8`
- 初始化脚本：`init-scripts/init.sql`
- 运行示例：
  - `psql -h <host> -U <user> -d <db> -f init-scripts/init.sql`
  - 首次运行会创建扩展、枚举、表、索引、触发器与视图，并插入示例数据（幂等）

## 2. 关键对象概览
- 表：`users`、`sessions`、`stations`、`trains`、`train_services`、`service_stops`、`service_segments`、`segment_seat_inventory`、`preorders`
- 视图：`v_train_search`（用于统一返回车次+席位）
- 枚举：`gender_enum`、`train_type_enum`、`seat_type_enum`、`ticket_type_enum`、`preorder_status_enum`
- 触发器：
  - `trg_service_date_range` 限制 `service_date` 在当前日起 14 天内
  - `trg_preorder_decrement` 预订占位创建时扣减库存
  - `trg_preorder_release` 预订状态改为 `canceled/expired` 时释放库存

## 3. 示例数据（执行初始化后可用）
- 站点：
  - `BJP` Beijing(北京)，`SHH` Shanghai(上海)
- 车次与服务日：
  - `D5`，服务日为 `current_date`
- 区间与时刻：
  - 北京(`07:21`) → 上海(`09:27`)，历时约 `2h06m`
- 席位库存：
  - `second` 总 500、剩 120、`31800` 分；`first` 总 100、剩 20、`62600` 分；`softSleeper` 总 60、剩 10、`94700` 分

## 4. 查询与调用方案
- 站点检索（供 `Home/Booking` 下拉与模糊搜索）：
  - 按 code：`SELECT * FROM stations WHERE code = $1;`
  - 模糊匹配：`SELECT * FROM stations WHERE lower(name_en) ILIKE '%'||lower($1)||'%' OR lower(pinyin) ILIKE '%'||lower($1)||'%' LIMIT 20;`
- 统一车次与余票查询（供 `/trains/search`）：
  - 视图：`v_train_search`
  - 查询示例：
    - `SELECT * FROM v_train_search WHERE from_station_id=$1 AND to_station_id=$2 AND date=$3 AND depart_time BETWEEN $4 AND $5 ORDER BY depart_time LIMIT $6 OFFSET $7;`
  - 仅高铁：在应用层过滤 `train_type IN ('G','D','C')` 或在 SQL 中增加条件
- 车次详情（可选）：
  - 停站：`SELECT * FROM service_stops WHERE train_service_id=$1 ORDER BY stop_seq;`
  - 区间：`SELECT * FROM service_segments WHERE train_service_id=$1 AND from_station_id=$2 AND to_station_id=$3;`
- 预订占位（`Book` 按钮）：
  - 创建：
    - `INSERT INTO preorders(user_id,train_service_id,from_station_id,to_station_id,segment_id,seat_type,hold_quantity,expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7, now()+interval '15 minutes') RETURNING id;`
    - 成功后触发器扣减 `segment_seat_inventory.left_seats`
  - 取消/过期：
    - `UPDATE preorders SET status='canceled' WHERE id=$1 AND user_id=$2;`（触发器释放库存）
  - 查询用户活跃占位：
    - `SELECT * FROM preorders WHERE user_id=$1 AND status='active' AND expires_at>now();`
- 会话与登录：
  - 按标识符查找：`SELECT * FROM users WHERE username=$1 OR email=$1 OR mobile=$1;`
  - 创建会话：`INSERT INTO sessions(user_id,expires_at,user_agent,ip) VALUES ($1, now()+interval '7 days',$2,$3) RETURNING sid;`

## 5. API 对应关系（后端参考）
- `POST /api/v1/auth/login` → 查 `users`，校验密码后插入 `sessions` 并设置 Cookie
- `POST /api/v1/auth/logout` → 删除或标记 `sessions.revoked_at`
- `GET /api/v1/session/me` → 依据 Cookie/Token 查 `sessions` 关联 `users`
- `POST /api/v1/auth/register` → 插入 `users`，唯一性冲突返回 409
- `GET /api/v1/stations` → 站点模糊或精确查询，返回 `id`、中/英文名与 `code`
- `GET /api/v1/dictionaries` → 后端常量或从枚举生成
- `GET /api/v1/trains/search` → 读 `v_train_search`，应用层分页与过滤
- `POST /api/v1/preorders` → 插入 `preorders`，触发器扣减库存；取消/过期更新状态释放库存

## 6. 典型参数组装
- 从 `Home` 跳 `Booking`：将 `fromStationId`、`toStationId`、`date` 作为查询串传入，后端直接套用视图查询
- 时间区间：`departTimeStart/departTimeEnd` 以 `TIME` 输入，SQL 用 `BETWEEN`
- 列车类型过滤：转换为 `ARRAY['G','D','C']` 并在 SQL 中 `train_type = ANY($arr)`

## 7. 约束与错误处理
- 日期范围：插入或更新 `train_services` 超出 14 天触发异常；API 层需提前校验并返回 400
- 余票不足：插入 `preorders` 时若库存不足，触发器抛错；API 层返回 409 并提示 `not enough seats`
- 并发：库存扣减与释放由数据库原子更新保障；应用层重试策略以事务或幂等键实现

## 8. 运维与权限
- 角色：`app_ro`（只读）、`app_rw`（读写）、`app_admin`（管理）
- 备份：优先逻辑备份 `pg_dump -Fc`；视图与触发器包含在脚本中可重建

## 9. 校验清单
- 视图返回字段是否与前端期望字段名一致（`trainNo/trainType/seats[]` 映射）
- 种子数据是否存在：`BJP/SHH`、`D5`、当天服务、区间与三类席别
- 触发器是否启用：插入占位与更新状态分别影响库存