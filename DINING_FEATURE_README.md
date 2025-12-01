# 餐饮特产功能实现说明

## 已完成的工作

### 后端实现 ✅
1. **创建了餐饮API接口** (`backend/internal/server/dining.go`)
   - `GET /api/v1/dining/products` - 返回列车自营商品
   - `GET /api/v1/dining/merchants` - 返回商家列表（支持筛选）
   - `GET /api/v1/dining/merchants/:id` - 返回商家详情

2. **注册路由** (`backend/internal/server/router.go`)
   - 已添加 `s.diningRoutes(v1)` 到路由配置

### 前端实现 ✅
1. **修改首页导航栏** (`frontend/src/pages/HomePage.vue`)
   - 添加"Business Services"下拉菜单
   - 添加"Dining & Specialty"链接

2. **创建搜索页面** (`frontend/src/pages/DiningSearchPage.vue`)
   - 日期、车次、出发站、到达站搜索表单
   - 跳转到商家列表页面

3. **创建商家列表页面** (`frontend/src/pages/DiningMerchantsPage.vue`)
   - 显示列车自营商品
   - 按站点分组显示商家
   - 显示商家状态（营业中/休息中）
   - 支持"显示可预订商家"筛选

4. **创建商家详情页面** (`frontend/src/pages/DiningMerchantDetailPage.vue`)
   - 商家信息展示
   - Tab切换（商品/评价/商家信息）
   - 商品分类和展示
   - 商品网格布局

5. **更新路由配置** (`frontend/src/main.ts`)
   - `/dining/search` - 搜索页面
   - `/dining/merchants` - 商家列表
   - `/dining/merchants/:id` - 商家详情

## 测试步骤

### 1. 启动后端
```bash
cd backend
go run ./cmd/server
```

后端将在 `http://localhost:8080` 启动

### 2. 启动前端
```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 3. 访问功能
1. 打开浏览器访问 `http://localhost:5173`
2. 在导航栏找到"Business Services" -> "Dining & Specialty"
3. 进入搜索页面，填写信息并搜索
4. 查看商家列表，点击商家进入详情
5. 在详情页浏览商品

## API测试

### 测试列车自营商品
```bash
curl http://localhost:8080/api/v1/dining/products
```

### 测试商家列表
```bash
curl "http://localhost:8080/api/v1/dining/merchants?trainNo=G103&date=2025-11-30&fromStation=Beijing&toStation=Shanghai"
```

### 测试商家详情
```bash
curl http://localhost:8080/api/v1/dining/merchants/merchant-1
```

## 数据说明

### 列车自营商品
- 青岛啤酒通道单头 - ¥20.00
- 依云矿泉水 - ¥13.00
- 杏鲍菇绿牛肉套餐 - ¥68.00

### 商家列表
- 肯德基（北京南站） - 营业中
- 赛百味（北京南站） - 营业中
- 京铁佳肴（北京南站） - 营业中
- 杨国福麻辣烫（济南西站） - 休息中
- 嘛嘛香牛肉面（济南西站） - 休息中
- 书亦烧仙草（济南西站） - 休息中

## UI特性

### 设计风格
- 蓝色主题 (#2563eb)
- 橙色按钮 (#f97316)
- 响应式设计
- 卡片式布局
- 悬停阴影效果

### 功能特性
- 下拉菜单导航
- 站点自动补全
- 商家状态标识
- 可预订筛选
- 商品分类筛选
- 星级评分显示

## 注意事项

1. 所有数据都是模拟数据，存储在后端代码中
2. "Not Purchased" 按钮点击后仅显示提示，无实际购买逻辑
3. 图片使用 placeholder 占位符
4. 后端需要数据库连接才能启动，确保 PostgreSQL 正在运行
5. 前端使用 Tailwind CSS，所有样式已内联

## 故障排查

如果后端无法启动：
1. 检查数据库是否运行：`docker ps | grep postgres`
2. 检查端口占用：`lsof -i:8080`
3. 查看后端日志输出

如果前端无法访问：
1. 检查前端是否运行：`lsof -i:5173`
2. 检查浏览器控制台错误
3. 确认后端API可访问

