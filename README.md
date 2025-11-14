# cs3604 · 12306 英文版演示站点

一个涵盖后端（Go + PostgreSQL）与前端（Vue 3 + TypeScript）的完整示例，提供英文版 12306 常用流程：站点查询、车次搜索、余票展示、下单占位等。已配置 CI 与简易 CD，可在服务器上自动部署至预览站点。

## 主要功能
- 站点字典与模糊搜索：按英文名或拼音查询站点列表（`/api/v1/stations`）。
- 车次搜索与过滤：按出发/到达站、日期、时间段筛选，并支持仅高铁（`G/D/C`）过滤（`/api/v1/trains/search`）。
- 余票与票价：统一视图 `v_train_search` 聚合区间与座席价格与余票；页面按座席类型展示。
- 预订占位：登录后对可订座席创建占位（`/api/v1/preorders`），触发器自动扣减库存；取消/过期释放库存。
- 数据滚动与初始化：
  - 初始化脚本插入“从今天起 14 天”的在售车次与库存（`init-scripts/*`）。
  - 每日 0 点定时清理过期车次，并补齐第 14 天，保证持续 14 天在售（`ensure_rolling_14_days()`）。

## 技术栈
- 后端：Go 1.23、Gin、GORM
- 数据库：PostgreSQL，扩展 `citext`、`pg_trgm`、`pgcrypto`
- 前端：Vue 3（Composition API）、TypeScript、Vite、Vitest
- 样式：Tailwind CSS 4
- 容器/编排：Docker Compose

## 亮点（CI/CD）
- GitHub Actions（CI）：
  - 后端工作流：启动数据库、执行 Go 单元测试（`/root/cs3604/.github/workflows/ci.yml:10-26`）。
  - 前端工作流：安装依赖并运行单元测试（`/root/cs3604/.github/workflows/ci.yml:27-41`）。
- 简易 CD：
  - CI 成功后调用部署通知接口（含令牌 `CD_TOKEN`），在自有服务器上触发自动部署（`/root/cs3604/.github/workflows/ci.yml:43-51`）。
  - 预览站点：`https://12306.vozn.dpdns.org`。

## 本地开发
- 前端：`cd frontend && npm install && npm run dev`
- 后端：`cd backend && go run ./cmd/server`
- 数据库：`docker compose up -d`（服务与数据库）

## 测试
- 前端单测：`npm run test:unit -- --run`
- 后端单测：`go test ./...`

## 目录结构
- `backend/` 后端代码（Gin 路由、服务、测试）
- `frontend/` 前端代码（Vue 页与组件、测试）
- `init-scripts/` 数据库初始化与滚动逻辑（14 天数据与库存）
- `.github/workflows/ci.yml` GitHub Actions 工作流（CI 与部署通知）

