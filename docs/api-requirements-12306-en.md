# 12306 英文版前端 API 需求文档（Scenario/Given/When/Then）

## 1. 总览
- 目标：支撑英文版 `Home`、`Booking`、`Login`、`Register` 四个页面的正常运行。
- 基础：`Base URL` 为 `/api/v1`；`Content-Type: application/json`；时区 `Asia/Shanghai`；日期格式 `YYYY-MM-DD`；时间格式 `HH:mm`。
- 认证：优先使用 `Cookie` 会话（`Set-Cookie: sid`），同时支持 `Authorization: Bearer <token>`；跨页保持登录态。
- 状态码与错误体：统一返回 `{ code, message, details? }`，详见“公共错误”。
- 版本与国际化：路径版本号 `v1`；查询参数 `lang=en|zh`，默认 `en`。

## 2. 认证与会话
### 2.1 登录
- Endpoint: `POST /api/v1/auth/login`
- Request:
  - `identifier`: string（Email/Username/Mobile）
  - `password`: string
  - `rememberMe?`: boolean（可选，默认 false）
- Response:
  - `user`: { `id`, `username`, `email?`, `mobile?` }
  - `session`: { `sid`, `expiresAt` }
- Scenario: 有效凭据登录
  - Given 用户提交正确 `identifier` 与 `password`
  - When 调用登录接口
  - Then 返回 200，设置 `sid` Cookie，响应包含 `user` 与 `session`，右上角可显示登录态入口。
- Scenario: 无效凭据
  - Given 用户提交错误凭据
  - When 调用登录接口
  - Then 返回 401，`message: Invalid credentials`，不设置 Cookie。
- Scenario: 账户锁定或频繁失败
  - Given 连续失败超过阈值
  - When 再次调用
  - Then 返回 429 或 423，并在 `details` 中给出解锁剩余时间。

### 2.2 登出
- Endpoint: `POST /api/v1/auth/logout`
- Response: 204，无体；清除 `sid` Cookie。
- Scenario: 退出登录
  - Given 用户已登录
  - When 调用登出接口
  - Then 会话失效，`sid` 被清除，页面需更新为未登录态。

### 2.3 会话查询
- Endpoint: `GET /api/v1/session/me`
- Response:
  - 未登录：401
  - 已登录：`{ user: { id, username, email?, mobile? } }`
- Scenario: 首屏检测登录态
  - Given 页面初始化
  - When 调用会话查询
  - Then 返回当前用户信息用于渲染 `My 12306` 与受限按钮。

### 2.4 注册
- Endpoint: `POST /api/v1/auth/register`
- Request 字段与 UI 对齐：
  - `nationality`: string
  - `name`: string
  - `passportNumber`: string
  - `passportExpirationDate`: `YYYY-MM-DD`
  - `dateOfBirth`: `YYYY-MM-DD`
  - `gender`: `male|female`
  - `username`: string
  - `password`: string
  - `email`: string
  - `agreeTerms`: boolean
- Response: `201 Created`，`{ user: { id, username, email }, next: "login" }`
- Scenario: 成功注册
  - Given 所有字段合法且唯一性通过
  - When 调用注册接口
  - Then 返回 201 并创建账号；引导进入登录页或自动登录（可配置）。
- Scenario: 字段校验失败
  - Given 不满足格式或必填
  - When 调用注册接口
  - Then 返回 400，`details` 包含逐字段错误。
- Scenario: 用户名/邮箱重复
  - Given `username/email` 已被占用
  - When 调用注册接口
  - Then 返回 409，`message: Already taken`。

## 3. 站点与字典
### 3.1 站点查询
- Endpoint: `GET /api/v1/stations`
- Query:
  - `q?`: string（模糊搜索，支持英文/拼音/中文）
  - `limit?`: number（默认 20，最大 50）
  - `lang?`: `en|zh`（默认 `en`）
- Response: `[{ id, nameEn, nameZh, cityEn?, cityZh?, code, pinyin? }]`
- Scenario: 模糊查询站点
  - Given 用户输入关键字 `bei`
  - When 调用 `/stations?q=bei`
  - Then 返回包含 `Beijing(北京)` 等匹配项，供下拉选择。

### 3.2 字典项
- Endpoint: `GET /api/v1/dictionaries`
- Response:
  - `trainTypes`: `['G','D','C','Z','T','K']`
  - `seatTypes`: `['business','first','second','softSleeper','hardSleeper','hardSeat']`
  - `ticketTypes`: `['adult','child','student']`
  - `dateRangeDays`: 14
- Scenario: 页面初始化加载字典
  - Given 进入首页或余票页
  - When 调用 `/dictionaries`
  - Then 返回用于渲染过滤与说明，保持与统一规则一致。

## 4. 余票与车次查询
### 4.1 统一查询接口
- Endpoint: `GET /api/v1/trains/search`
- Query:
  - `fromStationId`: string
  - `toStationId`: string
  - `date`: `YYYY-MM-DD`
  - `trainTypes?`: string（逗号分隔，如 `G,D,C`）
  - `departTimeStart?`: `HH:mm`（默认 `00:00`）
  - `departTimeEnd?`: `HH:mm`（默认 `24:00`）
  - `highSpeedOnly?`: boolean（默认 `false`）
  - `page?`: number（默认 1）
  - `pageSize?`: number（默认 20，最大 100）
- Response:
  - `items`: 数组，每项：
    - `trainNo`: string
    - `from`: { `stationId`, `nameEn`, `departTime` }
    - `to`: { `stationId`, `nameEn`, `arriveTime` }
    - `duration`: string（如 `7:21`）
    - `date`: `YYYY-MM-DD`
    - `seats`: 数组 `{ type, price, left, currency: 'CNY', bookable }`
    - `bookable`: boolean（任一席别可订）
    - `trainType`: `G|D|C|Z|T|K`
  - `page`: { `page`, `pageSize`, `total` }
- Scenario: 正常查询
  - Given `from/to/date` 合法且不同站
  - When 调用查询
  - Then 返回包含车次与各席别余票；若 `left=0` 则 `bookable=false`。
- Scenario: 高铁仅看
  - Given `highSpeedOnly=true`
  - When 调用查询
  - Then 仅返回 `G`/`D`/`C` 类型车次；其余过滤掉。
- Scenario: 出发时段过滤
  - Given 设置 `departTimeStart=06:00&departTimeEnd=12:00`
  - When 调用查询
  - Then 仅返回该时段内发车的车次。
- Scenario: 无结果
  - Given 过滤过严
  - When 调用查询
  - Then 返回 `items=[]`，`total=0`，状态码 200。
- Scenario: 参数错误
  - Given `fromStationId=toStationId`
  - When 调用查询
  - Then 返回 400，`message: Departure and destination cannot be the same`。
- Scenario: 日期越界
  - Given `date` 超出可查询范围（>14 天）
  - When 调用查询
  - Then 返回 400，`message: Date is out of query range`。

### 4.2 车次余票详情（可选）
- Endpoint: `GET /api/v1/trains/{trainNo}/left-tickets`
- Query: `date`, `fromStationId`, `toStationId`
- Response: `seats: [{ type, price, left, currency }]`
- Scenario: 行内展开详情
  - Given 用户展开某行详情
  - When 调用详情接口
  - Then 返回该车次区间的余票与价格并渲染。

## 5. 预订入口（占位以支持按钮）
- Endpoint: `POST /api/v1/preorders`
- Request: `{ trainNo, date, fromStationId, toStationId, seatType }`
- Response: `201 Created`，`{ preorderId, expiresAt }`
- Scenario: 点击 `Book`（已登录）
  - Given 用户已登录且席别可订
  - When 调用创建预订占位
  - Then 返回占位信息并跳转至后续预订流程页面。
- Scenario: 未登录拦截
  - Given 用户未登录
  - When 触发 `Book`
  - Then 前端不调用该接口，先跳登录；登录成功后重试创建占位。

## 6. 公共错误与限制
- 错误体：`{ code: string, message: string, details?: object }`
- 错误码：
  - `invalid_parameters`（400）
  - `unauthorized`（401）
  - `forbidden`（403）
  - `not_found`（404）
  - `conflict`（409）
  - `rate_limited`（429）
  - `server_error`（500）
- 速率限制：匿名 `60 req/min`，登录 `120 req/min`；超限返回 429，`details.retryAfterSeconds`。
- 分页：`page` 从 1 开始；最大 `pageSize=100`；超限返回 400。

## 7. 初始化数据（与统一规则对齐）
- Endpoint: `POST /api/v1/admin/init-seed`（仅管理员）
- 行为：插入示例站点、车次、价格与余票数据；为 UI 联调与测试提供稳定数据集。
- Scenario: 初始化成功
  - Given 管理员有权限
  - When 调用初始化
  - Then 返回 201 与已插入的记录统计；后续查询接口可用示例数据运行。

## 8. 安全与合规
- 所有写入接口要求 CSRF 防护或同源策略；`Set-Cookie` 使用 `Secure; HttpOnly; SameSite=Lax`。
- 密码仅通过加密通道传输；后端加盐哈希存储。
- PII 字段按最小化返回；错误信息不泄露内部堆栈。

## 9. 监控与日志（可选）
- 登录/注册成功与失败、查询耗时与结果数量、预订占位创建记录关键字段。
- 统一 `traceId` 通过响应头返回，便于前端问题排查。

## 10. 未来扩展占位
- `orders`：订单创建、支付、退票与改签接口。
- `passengers`：乘车人增删改查接口。
- `guides`：旅行指南内容接口。