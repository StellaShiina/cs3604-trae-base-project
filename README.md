# CS3604 12306 Project - Database Module

本项目为 CS3604 12306 复刻项目的主数据库模块，基于 PostgreSQL 构建。该模块独立封装，为主项目提供完整的数据库服务支持，包括表结构、预置数据及核心业务逻辑（触发器/存储过程）。

## � Docker 部署（集成指南）

主项目接入此数据库模块时，请参考以下步骤启动服务。

### 1. 启动服务

在本项目根目录下直接运行：

```bash
docker compose up -d
```

该命令将：
- 启动 PostgreSQL 容器
- 自动执行初始化脚本（建表、视图、触发器、种子数据导入）

### 2. 连接信息

数据库服务启动后，后端应用可通过以下配置进行连接：

- **Host**: `localhost` (容器间通信请使用 service name: `postgres` 或 `railway12306-postgres`)
- **Port**: `5432`
- **Database**: `railway_12306`
- **User**: `postgres`
- **Password**: `postgres`

> ⚠️ **注意**：具体的连接参数可在 `docker-compose.yml` 中查看或修改。

## 📚 核心文档

对于主项目开发人员，以下两份文档至关重要：

1. **[数据库需求与设计文档 (DB Requirements)](docs/db-requirements-12306-postgresql.md)**
   - 包含完整的 ER 图设计、表结构定义、枚举类型说明。
   - 详细描述了用户中心、订单系统（状态机）、客票库存管理等核心业务逻辑的数据库层实现。

2. **[后端对接指南 (Backend Tech Guide)](docs/backend-tech-guide-12306.md)**
   - 提供了后端 API 与数据库交互的映射关系。
   - 说明了如何利用数据库视图（如 `v_user_orders`）和触发器简化后端逻辑。

## 🛠️ 模块维护与测试

本模块包含独立的测试套件，用于验证数据库逻辑的正确性（仅供本模块维护参考，主项目集成无需关注）。

- **测试代码**: 位于 `db/` 目录下，使用 Go `testing` 模块编写。
- **概况脚本**: `db/database_info.py` 可用于快速查看数据库统计信息。
- **CI/CD**: 配置了 GitHub Actions (`.github/workflows`)，在 push 和 PR 时自动运行集成测试，保障 Schema 变更的稳定性。
