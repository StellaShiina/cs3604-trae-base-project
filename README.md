# 12306 购票系统复刻 (Backend)

这是 CS3604 12306 复刻项目的后端服务模块，基于 Go + Gin + GORM 实现，提供认证、乘车人管理、车次查询、下单与支付等核心接口。

后端接口规范（用于对齐前端与测试用例）位于 `backend/.artifacts/`；更详细的需求与对接说明位于 `backend/docs/`。

## 技术栈

- Go（Gin）
- GORM（PostgreSQL 驱动）
- PostgreSQL（本地或通过本仓库 `database/` 模块启动）
- 单元测试：Go `testing`（测试默认使用内存 SQLite）

## 功能范围

- 用户认证：注册、登录（两步验证流程）与会话 Cookie（`sid`）
- 乘车人管理：增删改查、数量上限、重复校验、默认乘车人保护
- 车次查询：按出发/到达站与日期查询
- 订单流转：订单填写页数据加载、下单、支付、取消、订单确认信息

## 本地运行

### 1. 准备数据库

后端默认使用 PostgreSQL。你可以直接使用本仓库的数据库模块启动：

```bash
cd database
docker compose up -d
```

### 2. 启动后端

在项目根目录执行：

```bash
cd backend/backend
go run .
```

默认监听端口：`http://localhost:8081`

## 环境变量

- `DATABASE_URL`：PostgreSQL DSN。
  - 未设置时，默认值为：
    - `host=localhost user=postgres password=postgres dbname=railway12306 port=5432 sslmode=disable TimeZone=Asia/Shanghai`

## 接口说明

后端统一前缀为 `/api/v1`，端口默认 `8081`。

- 认证：`/api/v1/auth/*`
  - 登录：`POST /api/v1/auth/login`
  - 发送登录验证码：`POST /api/v1/auth/send-sms`
  - 校验验证码并登录：`POST /api/v1/auth/verify-login`
  - 分步注册：`POST /api/v1/auth/register/*`
- 站点：`GET /api/v1/stations`
- 车次：`GET /api/v1/trains/search`
- 乘车人：`/api/v1/passengers`（需要登录，会校验 `sid` Cookie）
- 订单：`/api/v1/orders/*`（需要登录，会校验 `sid` Cookie）

接口规格文件：`backend/.artifacts/api_interface.yml`

## 测试

在项目根目录执行：

```bash
cd backend/backend
go test ./...
```

说明：单测默认使用内存 SQLite（见 `db.InitTest()`），因此运行测试不强依赖本地 PostgreSQL。

## 目录结构

```
backend/
├── .artifacts/            # 接口与数据描述（测试/对接依据）
├── backend/               # 后端服务代码（Go module: 12306-backend）
│   ├── db/                # 数据库连接与测试 DB 初始化
│   ├── models/            # GORM 模型定义
│   ├── routes/            # Gin 路由与处理函数
│   ├── services/          # 业务服务（例如车次初始化/调度）
│   └── main.go            # 入口
├── docs/                  # 需求/对接/测试说明文档
└── README.md              # 本文件
```

## 文档索引

- 后端需求与说明：`backend/docs/backend-requirements-12306.md`
- 后端与数据库对接：`backend/docs/backend-tech-guide-12306.md`
- 后端测试说明：`backend/docs/backend-tests-description.md`
- 前端接口对接指南：`backend/docs/frontend-api-guide-12306.md`

## CI

后端 CI 配置位于：`backend/.github/workflows/ci.yml`
