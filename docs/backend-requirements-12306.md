# 12306 后端需求规格说明书

## 1. 总览
本文档定义了 12306 火车票预订系统的后端需求。该文档基于总体需求和技术指南制定。后端构建于 **PostgreSQL 14+** 之上，并在 `/api/v1` 提供 RESTful API。

### 核心目标
- **核心业务**：用户管理、车站/车次查询、预订（库存控制）、订单处理和支付。
- **数据完整性**：使用数据库触发器进行严格的库存管理，防止超卖。
- **性能**：使用物化视图或优化视图（`v_train_search`）实现高效查询。
- **安全性**：基于会话的认证（`sid` cookie）和个人隐私信息（PII）保护。

---

## 2. 功能需求 (Gherkin)

### Feature: 用户认证与会话管理
  作为系统用户（乘客或管理员）
  我希望注册、登录并管理我的会话
  以便我可以访问预订和订单历史等个性化功能

  Background:
    Given 数据库已初始化用户表

  Scenario: 用户注册
    Given 用户提供有效的注册详细信息：
      | 字段 | 值 |
      | username | "jdoe" |
      | password | "SecurePass123" |
      <!-- email项为可选，若提供则必须是有效邮箱格式 -->
      | email | "jdoe@example.com" | 
      | mobile | "13800138000" |
      | name | "张三" |
      | id_type | "id_card" |
      | id_no | "110101199001011234" |
    When 调用 "注册" API
    Then 应在 `users` 表中创建新用户记录
    And 密码应当被哈希处理
    And API 应返回 HTTP 201 Created

  Scenario: 注册时用户名重复检测
    Given 数据库中已存在用户名为 "jdoe" 的用户
    When 用户尝试使用用户名 "jdoe" 注册
    Then 系统应返回 HTTP 409 Conflict
    And 错误消息应明确显示 "该用户名已经占用，请重新选择用户名！"

  Scenario: 登录时的身份校验与短信验证 (二步验证)
    # 第一步：用户输入账号密码触发验证
    When 用户输入 "jdoe" 和密码 "Pass123" (无论正确与否)
    Then 前端唤起 "证件号后4位" 和 "验证码" 输入弹窗

    # 第二步：请求发送验证码
    # 场景 2.1: 正常流程
    Given 存在用户 "jdoe"，证件号尾号 "5678"
    When 调用 "发送登录验证码" API，参数为：
      | username | "jdoe" |
      | id_card_last_4 | "5678" |
    Then 系统校验通过
    And 向用户手机发送短信验证码
    And 返回 HTTP 200 OK

    # 场景 2.2: 用户信息不匹配 (防枚举)
    # 包括：用户不存在、证件号尾号错误
    When 调用 "发送登录验证码" API，参数为：
      | username | "nonexistent" 或 "jdoe" |
      | id_card_last_4 | "0000" |
    Then 系统应拒绝发送短信
    But 为了防止用户枚举，API 仍应返回模糊的错误提示 "请输入正确的用户信息" (或统一错误码)
    And 实际上不发送任何短信

    # 第三步：提交登录
    # 场景 3.1: 登录成功
    When 调用 "登录" API，参数为：
      | username | "jdoe" |
      | password | "Pass123" |
      | sms_code | "123456" (正确) |
    Then 系统验证全部通过
    And 返回 Session ID 和用户信息

    # 场景 3.2: 密码错误
    When 调用 "登录" API，参数为：
      | username | "jdoe" |
      | password | "WrongPass" |
      | sms_code | "123456" (正确) |
    Then 系统返回 HTTP 401 Unauthorized
    And 错误消息为 "用户名或密码错误"


  Scenario: 使用无效凭据或验证码登录
    When 使用用户名 "jdoe" 和错误密码调用 "登录" API
    Then 系统应返回 HTTP 401 Unauthorized
    And 不应创建任何会话

  Scenario: 未登录访问受保护资源 (后端鉴权)
    Given 用户未登录 (无有效会话 ID)
    When 调用 "获取用户资料" 或 "获取订单列表" API
    Then 系统应返回 HTTP 401 Unauthorized
    # 前端收到 401 后会自动跳转到登录页，此逻辑由前端处理，但后端必须保证拒绝服务


### Feature: 乘车人管理
  作为注册用户
  我希望管理我的常用乘车人列表
  以便我在预订时可以快速选择他们

  Background:
    Given 已登录用户 ID 为 "user-123"

  Scenario: 添加新乘车人
    Given 该用户的乘车人数量少于 15 人
    When 调用 "添加乘车人" API，参数为：
      | name | "李四" |
      | card_type | "id_card" |
      | card_no | "110101200001011234" |
      | type | "adult" |
    Then 应在 `passengers` 表中插入一条关联到 "user-123" 的新记录
    And API 应返回 HTTP 201 Created

  Scenario: 防止重复乘车人
    Given "user-123" 已存在证件号为 "110101200001011234" 的乘车人
    When 使用相同的证件号调用 "添加乘车人" API
    Then 系统应返回 HTTP 409 Conflict
    And 数据库约束 `unique(user_id, card_no)` 应阻止插入

  Scenario: 乘车人数量上限
    Given 该用户已有 15 名乘车人
    When 调用 "添加乘车人" API
    Then 系统应返回 HTTP 400 Bad Request
    And 错误消息应指出 "已达到最大乘车人限制"

### Feature: 车站与车票查询
  作为用户
  我希望查询车站之间的火车票
  以便我规划行程

  Scenario: 查询有余票的车次
    Given 存在以下车次服务：
      | 车次 | 日期 | 出发地 | 目的地 | 出发时间 | 到达时间 |
      | G101 | 2025-11-15 | BJP | SHH | 08:00 | 12:00 |
    And "二等座" (second) 库存有 50 张票
    When 调用 "查询车次" API，参数为：
      | fromStation | "BJP" |
      | toStation | "SHH" |
      | date | "2025-11-15" |
    Then 响应结果应包含车次 "G101"
    And "二等座" 的座位信息应显示 "50" 张可用
    And "bookable" 标志应为 true

  Scenario: 查询无余票的车次
    Given "G101" 的 "二等座" 库存为 0
    When 调用 "查询车次" API
    Then 响应结果应包含车次 "G101"
    And "二等座" 的座位信息应显示 "0" 张可用
    And "bookable" 标志应为 false (或特定席别不可预订)

  Scenario: 按关键字查询车站
    Given 存在车站 "北京" (BJP) 和 "上海" (SHH)
    When 使用关键字 "Bei" 调用 "车站搜索" API
    Then 结果应包含 "北京"

  Scenario: 城市聚合查询 (多车站匹配)
    Given 城市 "北京" (BJP) 包含车站 "北京南" (VNP) 和 "北京西" (BXP)
    And 车次 "G1" 从 "北京南" (VNP) 出发
    When 调用 "查询车次" API，参数为：
      | fromStation | "BJP" | (北京)
    Then 响应结果应包含车次 "G1"
    And 响应中应注明实际出发站为 "北京南"

### Feature: 车票预订 (核心交易)
  作为已登录用户
  我希望预订特定车次的车票
  以便我确保有座位

  Background:
    Given 已登录用户 "user-123"
    And 车次 "G101" 从 "BJP" 到 "SHH" 日期 "2025-11-15"
    And 区段 "seg-1" 对应此行程

  Scenario: 成功提交订单
    Given "seg-1" 有 10 张 "二等座" 可用
    When 调用 "提交订单" API，参数为：
      | 车次 | G101 |
      | 乘车人 | [张三] |
      | 席别 | second |
    Then 应开启一个数据库事务
    And 应在 `orders` 表中创建一条状态为 `pending_payment` 的订单记录
    And 应在 `tickets` 表中创建车票记录
    And 触发器 `trg_ticket_decrement` 应被触发
    And "seg-1" 的 "二等座" 库存应减少到 9
    And 事务应提交
    And API 应返回新的订单 ID

  Scenario: 因库存不足预订失败
    Given "seg-1" 有 0 张 "二等座" 可用
    When 调用 "提交订单" API
    Then 数据库事务应因触发器异常 "not enough seats" 而失败
    And 系统应回滚事务
    And API 应返回 HTTP 409 Conflict

  Scenario: 超时自动释放库存
    Given 订单 "ord-001" 创建于 31 分钟前
    And 状态为 `pending_payment`
    When "订单清理任务" 运行
    Then 订单状态应更新为 `canceled`
    And 触发器 `trg_order_cancel_release` 应被触发
    And 关联席位的库存应增加

### Feature: 订单管理与支付
  作为用户
  我希望支付订单或取消订单
  以便我完成出行计划

  Scenario: 支付订单
    Given 订单 "ord-001" 状态为 `pending_payment`
    When 调用 "支付订单" API
    Then 支付应被处理
    And 订单状态应更新为 `paid`
    And 应在 `payments` 表中添加一条记录

  Scenario: 取消未支付订单
    Given 订单 "ord-001" 状态为 `pending_payment`
    When 调用 "取消订单" API
    Then 订单状态应更新为 `canceled`
    And 库存应立即释放

  Scenario: 退订已支付车票
    Given 订单 "ord-001" 状态为 `paid`
    And 该订单下的车票 "tkt-001" 状态为 `active`
    When 针对 "tkt-001" 调用 "退票" API
    Then 车票状态应更新为 `refunded`
    And 触发器 `trg_ticket_refund_release` 应被触发
    And 库存应被释放

---

## 3. 技术规格

### 3.1 数据库模式 (PostgreSQL)
*   **扩展**: `citext`, `pg_trgm`
*   **枚举**: `train_type_enum` (列车类型), `seat_type_enum` (席别), `ticket_type_enum` (票种), `order_status_enum` (订单状态) 等。
*   **关键表**:
    *   `users` (用户), `passengers` (乘车人)
    *   `stations` (车站), `trains` (列车), `train_services` (车次服务), `service_segments` (区段), `segment_seat_inventory` (库存)
    *   `orders` (订单), `tickets` (车票), `payments` (支付)
*   **视图**:
    *   `v_train_search`: 聚合车次服务、区段和库存数据以供查询。
    *   `v_user_orders`: 聚合用户历史记录的订单和车票详情。

### 3.2 数据库触发器 (业务逻辑强制)
1.  **`trg_ticket_decrement`**: 在 `tickets` 表 INSERT **之后**触发。扣减 `segment_seat_inventory` 中的 `left_seats`。如果计数 < 0 则抛出异常。
2.  **`trg_order_cancel_release`**: 在 `orders` 表 UPDATE **之后**触发。如果状态从 `pending_payment` 变为 `canceled`，则增加关联有效车票的库存。
3.  **`trg_ticket_refund_release`**: 在 `tickets` 表 UPDATE **之后**触发。如果状态从 `active` 变为 `refunded`，则增加库存。

### 3.3 API 标准
*   **基础 URL**: `/api/v1`
*   **认证**: 基于 Cookie (`sid`)。
*   **日期格式**: `YYYY-MM-DD`
*   **响应格式**: JSON `{ code, message, data }` (或直接返回数据，视框架而定，详见前端指南契约)。

## 4. 非功能需求与附录

### 4.1 性能
*   **索引**:
    *   `stations`: 针对 name/pinyin 建立 GIN 索引以支持快速模糊搜索。
    *   `service_segments`: 针对 `(from_station_id, to_station_id)` 建立组合索引以支持路线匹配。
    *   `orders`: 针对 `(user_id, status)` 建立索引以支持快速检索订单历史。
*   **并发**: 必须使用数据库事务进行预订以确保原子性。行级锁（通过 UPDATE）处理库存争用。

### 4.2 安全性
*   **密码**: 存储前必须进行哈希处理（如 bcrypt/argon2）。
*   **数据保护**: `card_no` (身份证号) 应被视为敏感数据。
*   **访问控制**: 用户只能查看/管理自己的订单和乘车人。

### 4.3 错误处理
*   `400 Bad Request`: 验证错误（如无效的日期格式）。
*   `401 Unauthorized`: 缺少会话或会话无效。
*   `403 Forbidden`: 访问他人的数据。
*   `404 Not Found`: 资源未找到（如车站不存在）。
*   `409 Conflict`: 违反业务逻辑（如 **座位不足 (Not Enough Seats)**、重复乘车人）。
*   `429 Too Many Requests`: 速率限制（可选但推荐）。

### 4.4 可追溯性
*   **来源**:
    *   `docs/requirements.md` (总体流程)
    *   `docs/backend-tech-guide-12306.md` (技术实现)
    *   `docs/db-requirements-12306-postgresql.md` (模式与触发器)
    *   `docs/frontend-api-guide-12306.md` (API 契约)

### 4.5 边缘情况与复杂场景补充
*   **同城多站 (City Aggregation)**: 明确了 City 到 Station 的映射需求。搜索城市（如 "北京"）应返回该城市下属所有车站（"北京南"、"北京西" 等）的车次。
*   **库存显示**: 
    *   **充裕**: 显示 "有票"。
    *   **紧张**: 当余票 < 20 张时，显示具体数字（如 "剩余 3 张"）。
    *   **无票**: 显示 "无票" 或 "候补"。
*   **购票限制**: 
    *   **实名制校验**: 同一身份证号在同一乘车日期、同一车次只能购买一张票。
    *   **行程冲突**: 系统应检查用户是否存在时间重叠的行程，避免购买无法乘坐的车票。
