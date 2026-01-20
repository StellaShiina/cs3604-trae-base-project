# CS3604 12306 Train Ticket Booking System

本项目是 CS3604 课程的 12306 铁路购票系统复刻项目，包含完整的全栈实现。

## 📚 项目简介

这是一个基于现代技术栈构建的铁路购票系统，旨在还原 12306 的核心业务流程，包括用户注册登录、车票查询、订单预订、客票管理等功能。

## 🛠️ 技术栈 (Tech Stack)

### Backend (后端)
- **Language**: Go (Golang)
- **Framework**: Gin Web Framework
- **ORM**: GORM
- **Database Driver**: PostgreSQL Driver

### Frontend (前端)
- **Framework**: Vue 3
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: SCSS / Sass
- **HTTP Client**: Axios

### Database (数据库)
- **Database**: PostgreSQL
- **Tools**: Docker, PL/pgSQL (Stored Procedures/Triggers)

## 📂 项目结构

- `backend/`: Go 后端 API 服务
- `frontend/`: Vue 3 前端应用
- `db/`: 数据库工具与测试模块
- `db-init/`: 数据库初始化 SQL 脚本
- `docs/`: 项目需求与设计文档

## 🚀 快速开始 (Getting Started)

### 前置要求
- Docker & Docker Compose
- Go 1.25+
- Node.js 18+ & npm

### 1. 启动数据库

使用 Docker Compose 启动 PostgreSQL 数据库服务。该命令会自动执行初始化脚本（建表、视图、触发器、种子数据导入）。

```bash
docker compose up -d
```

**数据库连接信息:**
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `railway_12306`
- **User**: `postgres`
- **Password**: `postgres`

### 2. 启动后端服务

进入后端目录，安装依赖并启动服务：

```bash
cd backend
go mod tidy
go run main.go
```

服务将在 `http://localhost:8081` 启动。

### 3. 启动前端应用

进入前端目录，安装依赖并启动开发服务器：

```bash
cd frontend
npm install
npm run dev
```

访问控制台输出的本地地址（通常是 `http://localhost:5173`）即可体验应用。

## � 核心文档

详细的设计与需求文档位于 `docs/` 目录下：

- **[数据库需求与设计 (DB Requirements)](docs/db-requirements-12306-postgresql.md)**: ER 图、表结构、核心业务逻辑。
- **[后端技术指南 (Backend Tech Guide)](docs/backend-tech-guide-12306.md)**: API 映射、数据库交互说明。
- **[前端 API 指南](docs/frontend-api-guide-12306.md)**: 前端接口调用说明。

## 🧪 测试

### 后端测试
```bash
cd backend
go test ./...
```

### 数据库模块测试
```bash
cd db
go test -v
```

## 🤝 贡献与维护
本项目由 CS3604 课程小组维护。
