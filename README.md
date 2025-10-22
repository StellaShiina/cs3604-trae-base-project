# 12306铁路订票系统

一个基于Vue.js + Go的现代化铁路订票系统。

## 快速启动

### Windows用户
双击运行 `start.bat` 文件即可启动所有服务。

### Linux/Mac用户
在终端中运行：
```bash
chmod +x start.sh
./start.sh
```

## 手动启动

如果需要手动启动服务，请按以下步骤操作：

### 1. 启动后端服务
```bash
cd backend
go run src/main.go
```

### 2. 启动前端服务
```bash
cd frontend
npm install  # 首次运行需要安装依赖
npm run dev
```

## 访问地址

- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:8080

## 测试账户

系统提供以下测试账户用于登录：

- **用户名**: `testuser` **密码**: `validpassword`
- **邮箱**: `test@example.com` **密码**: `validpassword`
- **手机号**: `13800138000` **密码**: `validpassword`

## 功能特性

- ✅ 用户注册与登录
- ✅ 个人中心管理
- ✅ 响应式设计
- ✅ JWT身份验证
- ✅ CORS跨域支持

## 技术栈

### 前端
- Vue.js 3
- TypeScript
- Vite
- 现代化UI设计

### 后端
- Go
- Gin框架
- JWT认证
- GORM (模拟数据库)

## 开发环境要求

- Node.js >= 16.0.0
- Go >= 1.19
- 现代浏览器

## 项目结构

```
12306_1/
├── frontend/          # 前端Vue.js应用
├── backend/           # 后端Go应用
├── start.sh          # Linux/Mac启动脚本
├── start.bat         # Windows启动脚本
└── README.md         # 项目说明
```