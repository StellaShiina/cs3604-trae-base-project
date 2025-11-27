# CS3604 Database Project (12306 Replica)

本项目是 CS3604 课程数据库项目，旨在复刻 12306 铁路购票系统的核心数据库设计与实现。基于 PostgreSQL 构建，支持高并发下的车票查询、预订、支付及订单管理等完整业务流程。

## 📋 环境要求

- **Docker**: 20.10+
- **Docker Compose**: v2.0+
- **Go**: 1.18+ (用于运行测试)
- **Python**: 3.8+ (用于运行概况脚本)
- **PostgreSQL Client** (可选，用于手动连接)

## 🚀 快速启动

本项目使用 Docker Compose 进行容器化部署，一键即可启动数据库服务。

### 1. 启动数据库

在项目根目录下执行：

```bash
docker compose up -d
```

该命令将启动 PostgreSQL 容器，并自动执行 `db-init/` 目录下的 SQL 脚本进行数据库初始化（建表、视图、触发器及导入种子数据）。

### 2. 验证连接

数据库默认配置如下（可在 `docker-compose.yml` 中查看）：
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `railway_12306`
- **User**: `postgres`
- **Password**: `postgres`

你可以使用 `psql` 或其他数据库客户端连接验证：

```bash
psql -h localhost -p 5432 -U postgres -d railway_12306
```

## 🧪 测试与验证

项目提供了 Go 语言编写的集成测试套件和 Python 概况脚本，位于 `db/` 目录下。

### 1. 运行 Go 集成测试

测试涵盖了用户管理、车次查询、订单创建、支付流程、改签退票等核心场景。

进入 `db` 目录并运行测试：

```bash
cd db
go test -v ./...
```

或者运行特定测试文件：

```bash
go test -v db_test.go
```

### 2. 查看数据库概况

提供了一个 Python 脚本 `database_info.py`，用于展示当前数据库的表结构、行数统计及关键视图数据。

首先安装依赖（如有）：

```bash
cd db
pip install -r requirements.txt  # 如果有 requirements.txt
# 或者直接运行，通常依赖仅需 psycopg2 或类似库
```

运行脚本：

```bash
python database_info.py
```

## 🤖 CI/CD 工作流 (GitHub Actions)

本项目配置了 GitHub Actions 以保障代码质量和稳定性。

### 1. Run Tests on Push
- **触发条件**: 向 `db` 分支推送代码时自动触发。
- **执行内容**: 
  - 启动 PostgreSQL 容器。
  - 运行 Go 集成测试 (`go test -v ./...`)。
- **目的**: 确保最新提交的代码通过所有测试用例。

### 2. Run Tests on PR
- **触发条件**: 向 `db` 分支提交 Pull Request 时自动触发。
- **执行内容**:
  - 启动 PostgreSQL 容器。
  - 运行 Go 集成测试。
- **自动拦截机制**: 
  - 如果测试失败，Action 会自动在 PR 中评论错误信息，并**直接关闭该 PR**。
  - 目的：防止未通过测试的代码合并到主分支，强制要求开发者在提交前修复所有问题。

## 📂 目录结构

```
.
├── .github/workflows/      # GitHub Actions 工作流配置
│   ├── push-test.yml       # Push 触发测试
│   └── pr-test.yml         # PR 触发测试与自动关闭
├── db/                     # 测试代码与工具脚本
│   ├── db_test.go          # Go 集成测试
│   ├── database_info.py    # 数据库概况脚本
│   └── ...
├── db-init/                # 数据库初始化脚本
│   ├── 00-init.sql         # 核心建表与触发器逻辑
│   ├── 01-seed-data.sql    # 基础种子数据
│   └── ...                 # 路由数据
├── docs/                   # 技术文档
│   ├── db-requirements...  # 详细数据库设计文档
│   └── backend-tech...     # 后端对接指南
├── docker-compose.yml      # 容器编排文件
└── README.md               # 本文件
```

## 📚 文档资源

- [数据库详细设计 (PostgreSQL)](docs/db-requirements-12306-postgresql.md): 包含完整的 Schema 定义、枚举、触发器及设计思路。
- [后端开发指南](docs/backend-tech-guide-12306.md): 提供 API 与 SQL 的映射关系、核心交易流程说明及运维建议。
