# 后端测试用例覆盖描述 (Backend Test Coverage Description)

本文档描述了当前后端项目 (`backend`) 中已实现的自动化测试用例及其覆盖的业务场景。测试基于 Go 原生 `testing` 框架和 `httptest` 包，结合 SQLite 内存数据库进行集成测试。

## 1. 用户认证与会话 (User Authentication & Session)

测试文件: `routes/auth_test.go`

### 1.1 用户注册 (User Registration)
- **TestRegister/Success**:
    - **场景**: 用户提交合法的注册信息（用户名、密码、邮箱、手机号、身份证号等）。
    - **验证**:
        - API 返回 HTTP 201 Created。
        - 响应体包含新创建的 `userId`。
        - 数据库中成功创建用户记录。
- **TestRegister/DuplicateUser** (TODO):
    - **场景**: 尝试注册已存在的用户名或身份证号。
    - **预期**: 返回 HTTP 409 Conflict。

### 1.2 二步验证登录 (2FA Login with SMS)
- **TestLogin/SendSMS_Success**:
    - **场景**: 用户请求发送短信验证码，且提供的用户名与身份证号后4位匹配。
    - **验证**: API 返回 HTTP 200 OK，模拟发送成功。
- **TestLogin/SendSMS_Fail_WrongID**:
    - **场景**: 用户请求发送验证码，但提供的身份证号后4位与数据库不匹配。
    - **验证**: API 返回非 200 状态码（如 400 Bad Request），拒绝发送。
- **TestLogin/Login_Success**:
    - **场景**: 用户提交正确的用户名、密码以及有效的短信验证码。
    - **验证**: API 返回 HTTP 200 OK，并设置 Session Cookie。
- **TestLogin/Login_Fail_WrongSMS**:
    - **场景**: 用户提交错误的短信验证码。
    - **验证**: API 返回 HTTP 401 Unauthorized。

### 1.3 权限控制 (Authorization)
- **TestUnauthorizedAccess/GetOrders_Unauthorized**:
    - **场景**: 未登录（无有效 Session Cookie）用户尝试访问受保护的资源（如获取订单列表）。
    - **验证**: API 应返回 HTTP 401 Unauthorized。

---

## 2. 乘车人管理 (Passenger Management)

测试文件: `routes/passengers_test.go`

### 2.1 添加乘车人 (Add Passenger)
- **TestAddPassenger/Success**:
    - **场景**: 已登录用户添加合法的乘车人信息（姓名、证件类型、证件号、旅客类型）。
    - **验证**:
        - API 返回 HTTP 201 Created。
        - 响应体包含新创建的乘车人 ID。
        - 数据库中该用户下关联了新的乘车人记录。
- **TestAddPassenger/LimitReached** (TODO):
    - **场景**: 用户尝试添加超过上限（如 15 人）的乘车人。
    - **预期**: 返回 HTTP 400 Bad Request。

---

## 3. 车票预订与订单 (Booking & Orders)

测试文件: `routes/orders_test.go`

### 3.1 创建订单 (Create Order)
- **TestCreateOrder/Success**:
    - **场景**: 已登录用户对有余票的车次提交订单（包含车次号、席别、乘车人列表）。
    - **验证**:
        - API 返回 HTTP 201 Created。
        - 响应体包含 `orderId`。
        - 数据库中创建了状态为 `pending_payment` 的订单。
        - 关联的座位库存被扣减（通过触发器或业务逻辑）。
- **TestCreateOrder/NotEnoughSeats** (TODO):
    - **场景**: 用户尝试预订已无余票的车次/席别。
    - **预期**: 返回 HTTP 409 Conflict，且不创建订单。

---

## 4. 车次查询 (Train Search)

测试文件: `routes/trains_test.go`

### 4.1 基础查询 (Basic Search)
- **TestSearchTrains/Success**:
    - **场景**: 根据出发站、到达站和日期查询车次。
    - **验证**: API 返回 HTTP 200 OK，响应体包含符合条件的车次列表及余票信息。

### 4.2 城市聚合查询 (City Aggregation)
- **TestSearchTrains/CityAggregation_Success** (Pending Implementation):
    - **场景**: 用户输入城市代码（如 "BJP" 北京），系统应返回该城市下属所有车站（如 "VNP" 北京南, "BXP" 北京西）的出发车次。
    - **验证**: 响应结果中包含从不同具体车站出发但属于同一城市的车次。

---

## 总结
目前测试套件覆盖了核心的**Happy Paths**（注册、登录、查询、下单、添加乘车人）以及关键的**安全路径**（短信验证码校验、未登录鉴权）。部分边缘情况（如库存不足、重复用户、人数上限）已定义测试结构，待进一步完善实现细节。
