# Troubleshooting Guide / 故障排除指南

This guide helps you resolve common issues when running the 12306 project locally.

## 数据库连接问题 (Database Connection Issues)

### 症状 (Symptoms)
```
failed to connect to `user=postgres database=railway12306`:
127.0.0.1:5432 (localhost): dial error: dial tcp 127.0.0.1:5432: connectex: 
No connection could be made because the target machine actively refused it.
```

### 原因 (Root Cause)
PostgreSQL 数据库未运行。

### 解决方案 (Solution)

#### Windows
1. 启动 Docker Desktop
   - 打开 Docker Desktop 应用程序
   - 等待 Docker Desktop 完全启动（任务栏图标不再转动）

2. 启动数据库容器
   ```bash
   cd <project-root>
   docker compose up -d
   ```

3. 验证容器运行
   ```bash
   docker ps
   ```
   应该看到类似输出：
   ```
   CONTAINER ID   IMAGE                COMMAND                  STATUS
   xxxxx          postgres:16-alpine   "docker-entrypoint..."   Up X seconds
   ```

4. 如果 Docker Desktop 无法启动，检查：
   - WSL 2 是否已启用（Windows 10/11）
   - Hyper-V 是否已启用（Windows 10 Pro/Enterprise）
   - 磁盘空间是否充足

#### Mac/Linux
1. 确保 Docker 守护进程正在运行
   ```bash
   docker info
   ```

2. 如果 Docker 未运行，启动它：
   - **Mac**: 打开 Docker Desktop 应用
   - **Linux**: `sudo systemctl start docker`

3. 启动数据库容器
   ```bash
   cd <project-root>
   docker compose up -d
   ```

4. 验证容器运行
   ```bash
   docker ps
   ```

---

## 端口占用问题 (Port Already in Use)

### 症状 (Symptoms)
```
[GIN-debug] [ERROR] listen tcp :8080: bind: Only one usage of each socket address 
(protocol/network address/port) is normally permitted.
```

### 原因 (Root Cause)
端口 8080 已被另一个进程占用（可能是之前启动的后端服务）。

### 解决方案 (Solution)

#### Windows
1. 查找占用端口的进程
   ```bash
   netstat -ano | findstr :8080
   ```
   输出示例：
   ```
   TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    2160
   ```
   最后一列 `2160` 是进程 ID (PID)。

2. 终止进程
   ```bash
   taskkill /PID 2160 /F
   ```

3. 验证端口已释放
   ```bash
   netstat -ano | findstr :8080
   ```
   应该没有输出。

#### Mac/Linux
1. 查找占用端口的进程
   ```bash
   lsof -i :8080
   ```
   或
   ```bash
   netstat -tuln | grep :8080
   ```

2. 终止进程
   ```bash
   kill -9 <PID>
   ```
   将 `<PID>` 替换为实际的进程 ID。

---

## Docker 相关问题 (Docker Issues)

### 症状 (Symptoms)
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### 原因 (Root Cause)
Docker Desktop 未运行或 Docker 守护进程未启动。

### 解决方案 (Solution)

#### Windows
1. 检查 Docker Desktop 是否在运行
   - 查看任务栏是否有 Docker 图标
   - 如果没有，启动 Docker Desktop

2. 等待 Docker Desktop 完全启动
   - 图标会从转动变为静止
   - 可能需要 1-2 分钟

3. 验证 Docker 可用
   ```bash
   docker version
   ```

#### Mac
1. 打开 Docker Desktop 应用
2. 等待菜单栏中的 Docker 图标变为静止
3. 验证：
   ```bash
   docker version
   ```

#### Linux
1. 启动 Docker 守护进程
   ```bash
   sudo systemctl start docker
   ```

2. 设置 Docker 开机自启（可选）
   ```bash
   sudo systemctl enable docker
   ```

3. 验证：
   ```bash
   docker version
   ```

---

## 数据库数据初始化问题 (Database Initialization Issues)

### 症状 (Symptoms)
- 后端启动成功，但 API 返回空数据
- 查询车次时没有结果

### 原因 (Root Cause)
数据库初始化脚本未执行或执行失败。

### 解决方案 (Solution)

1. 检查数据库日志
   ```bash
   docker logs railway12306-postgres
   ```
   查找是否有 SQL 错误。

2. 重新初始化数据库
   ```bash
   # 停止并删除容器和数据卷
   docker compose down -v
   
   # 重新启动（将自动运行初始化脚本）
   docker compose up -d
   
   # 等待几秒让初始化完成
   sleep 10
   
   # 检查日志
   docker logs railway12306-postgres
   ```

3. 手动连接数据库验证
   ```bash
   docker exec -it railway12306-postgres psql -U postgres -d railway12306
   ```
   
   在 PostgreSQL 提示符下运行：
   ```sql
   -- 检查表是否存在
   \dt
   
   -- 检查站点数据
   SELECT COUNT(*) FROM stations;
   
   -- 检查车次数据
   SELECT COUNT(*) FROM trains;
   
   -- 退出
   \q
   ```

---

## 环境变量配置 (Environment Variables)

如果需要使用非默认配置，可以设置以下环境变量：

### 数据库配置
```bash
# Windows PowerShell
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="postgres"
$env:DB_NAME="railway12306"
$env:DB_SSLMODE="disable"

# Windows CMD
set DB_HOST=127.0.0.1
set DB_PORT=5432
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_NAME=railway12306
set DB_SSLMODE=disable

# Mac/Linux
export DB_HOST="127.0.0.1"
export DB_PORT="5432"
export DB_USER="postgres"
export DB_PASSWORD="postgres"
export DB_NAME="railway12306"
export DB_SSLMODE="disable"
```

### 后端端口配置
```bash
# Windows PowerShell
$env:PORT="8080"

# Windows CMD
set PORT=8080

# Mac/Linux
export PORT="8080"
```

### 前端 CORS 配置
```bash
# Windows PowerShell
$env:DEV_FRONTEND_ORIGIN="http://localhost:5173"

# Windows CMD
set DEV_FRONTEND_ORIGIN=http://localhost:5173

# Mac/Linux
export DEV_FRONTEND_ORIGIN="http://localhost:5173"
```

---

## 完整启动检查清单 (Complete Startup Checklist)

按顺序检查以下各项：

- [ ] Docker Desktop/Engine 正在运行
  ```bash
  docker version
  ```

- [ ] 数据库容器已启动
  ```bash
  docker ps | grep railway12306-postgres
  ```

- [ ] 数据库可以连接
  ```bash
  docker exec railway12306-postgres pg_isready -U postgres
  ```

- [ ] 端口 8080 未被占用
  ```bash
  # Windows
  netstat -ano | findstr :8080
  
  # Mac/Linux
  lsof -i :8080
  ```
  应该没有输出或只显示你自己的进程。

- [ ] 后端可以启动
  ```bash
  cd backend
  go run ./cmd/server
  ```
  应该看到 "Database connected successfully" 和 "Server starting on..."

- [ ] 前端可以访问
  ```bash
  cd frontend
  npm run dev
  ```
  浏览器打开 http://localhost:5173

---

## 获取更多帮助 (Getting More Help)

如果以上方法都无法解决问题：

1. 收集以下信息：
   - 操作系统和版本
   - Docker 版本：`docker version`
   - Go 版本：`go version`
   - Node 版本：`node --version`
   - 完整的错误日志

2. 检查项目 Issues 是否有类似问题

3. 创建新的 Issue 并附上收集的信息
