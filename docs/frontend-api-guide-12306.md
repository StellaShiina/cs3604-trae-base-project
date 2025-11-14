# 12306 英文版前端 API 技术文档（调用标准）

## 1. 基本约定
- Base URL：`/api/v1`
- Content-Type：`application/json`
- 时区：`Asia/Shanghai`
- 日期/时间：`YYYY-MM-DD`、`HH:mm`
- 认证：优先 `Cookie`（`sid`），兼容 `Authorization: Bearer <token>`
- 语言：`lang=en|zh`，默认 `en`
- 错误体：`{ code, message, details? }`

## 2. 鉴权与会话
- 登录 `POST /api/v1/auth/login`
  - Request：`{ identifier, password, rememberMe? }`
  - Response：`{ user, session }` 并设置 `sid` Cookie
  - 错误：401 `Invalid credentials`
- 登出 `POST /api/v1/auth/logout` → 204（清 Cookie）
- 会话 `GET /api/v1/session/me`
  - 401 未登录；200 返回 `{ user }`
- 前端约定：登录成功后刷新导航状态；若通过 `Book` 跳转到登录，登录成功需返回原来源页。

## 3. 注册
- `POST /api/v1/auth/register`
  - Request：与 UI 字段一致（`nationality/name/passportNumber/...`）
  - 成功：201 返回 `{ user, next: "login" }`
  - 失败：400 字段错误聚合；409 重复（`Already taken`）
- 前端约定：字段逐项展示错误；密码复杂度本地预校验。

## 4. 站点与字典
- 站点 `GET /api/v1/stations`
  - Query：`q?`、`limit?`、`lang?`
  - 用途：`Home/Booking` 下拉与模糊匹配
- 字典 `GET /api/v1/dictionaries`
  - 返回：`trainTypes/seatTypes/ticketTypes/dateRangeDays`
  - 用途：渲染过滤控件与校验日期范围（14 天）

## 5. 余票查询（Booking）
- `GET /api/v1/trains/search`
  - Query：
    - 必填：`fromStationId`、`toStationId`、`date`
    - 可选：`trainTypes`（逗号分隔）、`departTimeStart`、`departTimeEnd`、`highSpeedOnly`、`page`、`pageSize`
  - Response：
    - `items[]`：`{ trainNo, trainType, date, from{stationId,nameEn,departTime}, to{stationId,nameEn,arriveTime}, duration, seats[], bookable }`
    - `page`：`{ page, pageSize, total }`
  - 错误：
    - 400 同站点或日期越界；200 空数组表示无结果
- 前端约定：
  - 从 `Home` 跳转应携带查询串；进入后自动调用并渲染
  - `highSpeedOnly=true` 等价于 `trainTypes=G,D,C`
  - 座位 `left=0` 对应按钮禁用或 `Sold out`

## 6. 预订占位（Book 按钮）
- `POST /api/v1/preorders`
  - Request：`{ trainNo, date, fromStationId, toStationId, seatType }`
  - Response：`{ preorderId, expiresAt }`（201）
  - 前置：需已登录；未登录时前端先跳登录，成功后重试占位
- 前端约定：
  - 创建成功后进入后续预订流程页面（非本文范围）
  - 若返回 409 `not enough seats`，提示并刷新余票列表

## 7. 错误与重试
- 标准错误码：`invalid_parameters(400)`、`unauthorized(401)`、`forbidden(403)`、`not_found(404)`、`conflict(409)`、`rate_limited(429)`、`server_error(500)`
- 重试建议：查询类失败显示 `Retry`；写入类谨慎重试并避免重复提交（按钮防抖）
- 提示规范：贴近字段的错误；顶部通用错误用于登录失败等

## 8. 请求示例
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "identifier": "demo@site.com", "password": "Passw0rd" }
```
```http
GET /api/v1/stations?q=bei&limit=10&lang=en
```
```http
GET /api/v1/trains/search?fromStationId=<BJP_ID>&toStationId=<SHH_ID>&date=2025-11-14&highSpeedOnly=true&departTimeStart=06:00&departTimeEnd=12:00&page=1&pageSize=20
```
```http
POST /api/v1/preorders
Content-Type: application/json

{ "trainNo":"D5", "date":"2025-11-14", "fromStationId":"<BJP_ID>", "toStationId":"<SHH_ID>", "seatType":"second" }
```

## 9. 前端数据契约
- 站点项：`{ id, code, nameEn, nameZh, pinyin? }`
- 字典：数组纯字符串；日期范围 `dateRangeDays=14`
- 查询结果：`seats[]` 项含 `type/price/left/currency/bookable`
- 登录态：依据 `session.me` 返回 `user` 渲染右上角 `My 12306`

## 10. 事件追踪（可选）
- 埋点：`Search clicked`、`Book clicked`、登录/注册成功/失败、过滤变更
- 字段：来源页面、查询条件、结果数量、错误码、耗时、`traceId`