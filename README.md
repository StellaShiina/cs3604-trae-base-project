# 12306 购票系统复刻 (Frontend Vue)

这是一个基于 Vue 3 + TypeScript + Vite 开发的铁路购票系统前端项目，旨在复刻中国铁路 12306 网站的核心业务流程。

## ✨ 项目简介

本项目实现了从用户登录注册、车票查询、预订、支付到订单管理的完整购票闭环。界面和交互逻辑参考了 12306 官方网站，提供了一个现代化的 Web 购票体验。

## 🚀 技术栈

- **框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **路由**: [Vue Router 4](https://router.vuejs.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **CSS 预处理**: [Sass](https://sass-lang.com/)
- **HTTP 请求**: [Axios](https://axios-http.com/)
- **测试**: [Vitest](https://vitest.dev/)

## 📦 功能模块

### 1. 用户认证 (Auth)
- **登录 (`/login`)**: 支持用户名/邮箱/手机号登录。
- **注册 (`/register`)**: 包含实名认证、手机号验证、密码强度检测等完善的表单校验。
- **找回密码 (`/forgot-password`)**: 通过手机号或邮箱找回账户密码。

### 2. 车票查询与预订 (Train)
- **首页 (`/`)**: 快速入口与导航。
- **车票查询 (`/search`)**: 支持根据出发地、目的地、日期查询车次。
- **订单填写 (`/order`)**: 选择席别、添加/选择乘车人。

### 3. 订单与支付 (Order & Payment)
- **支付页 (`/payment/:orderId`)**: 模拟支付倒计时与支付流程。
- **购票成功 (`/purchase-success/:orderId`)**: 展示订单完成状态。

### 4. 个人中心 (Personal)
- **个人中心 (`/personal-center`)**: 查看个人信息、管理常用联系人（乘车人）、查看历史订单。

## 🛠️ 安装与运行

确保您的环境中已安装 [Node.js](https://nodejs.org/) (推荐 LTS 版本)。

1. **安装依赖**

```bash
npm install
```

2. **启动开发服务器**

```bash
npm run dev
```
启动后访问 `http://localhost:5173` (或控制台显示的端口)。

3. **构建生产版本**

```bash
npm run build
```

4. **运行测试**

```bash
npm run test
```

## 📂 目录结构

```
src/
├── api/             # API 接口封装
├── assets/          # 静态资源 (图片, SVG)
├── components/      # 公共组件与业务组件
│   ├── Auth/        # 认证相关组件
│   ├── Common/      # 通用 UI 组件
│   ├── Train/       # 车票查询与展示组件
│   ├── Payment/     # 支付相关组件
│   └── Personal/    # 个人中心组件
├── router/          # 路由配置
├── stores/          # Pinia 状态管理
├── utils/           # 工具函数
├── views/           # 页面级视图组件
├── App.vue          # 根组件
├── main.ts          # 入口文件
└── style.css        # 全局样式
```

## 📝 开发规范

- 使用 Vue 3 Composition API (`<script setup lang="ts">`)。
- 严格遵循 TypeScript 类型定义。
- 组件命名采用 PascalCase。
- 样式使用 Scoped CSS 或 CSS Modules。

---
*本项目仅供学习与交流使用，非官方 12306 网站。*
