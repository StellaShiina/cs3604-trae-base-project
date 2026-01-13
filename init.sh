#!/bin/bash

echo "开始初始化项目..."

echo "Creating Frontend (React)..."

# 使用 React 模板
npm create vite@latest frontend -- --template react

cd frontend

# 安装基础依赖
echo "Installing Frontend dependencies..."
npm install

# 安装 metadata.md 规定的核心库
# axios: HTTP 请求
# react-router-dom: 路由
npm install axios react-router-dom jsdom

# 安装开发依赖 (Testing)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm pkg set scripts.test="vitest"

# 初始化测试与基础结构

# --- 清理 Vite 默认文件并构建目录结构 ---
echo "Configuring Frontend structure..."

# 1. 清理默认资源
rm -rf src/assets
rm -f src/App.css
rm -f src/components/* # 删除默认的 React logo 组件等

# 2. 创建 metadata.md 规定的目录
mkdir -p src/api
mkdir -p src/pages
mkdir -p test
mkdir -p test/pages

# 2.1 创建 test/setup.js
cat <<EOF > test/setup.js
import '@testing-library/jest-dom';
EOF

# 2.2 配置 vite.config.js 以支持 Vitest
cat <<EOF > vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
  },
})
EOF

# 3. 重置样式文件
cat <<EOF > src/index.css
EOF

# 4. 创建 src/api/index.js
cat <<EOF > src/api/index.js
import axios from 'axios';
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});
export default apiClient;
EOF

# 5. 创建 src/pages/HomePage.jsx
# 5.1 创建 HomePage.css
touch src/pages/HomePage.css

cat <<EOF > src/pages/HomePage.jsx
import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div>Home</div>
  );
};
export default HomePage;
EOF

# 6. 重写 src/App.jsx
cat <<EOF > src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
export default App;
EOF

# 7. 重写 src/main.jsx (引入 BrowserRouter)
cat <<EOF > src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
EOF

# 返回根目录
cd ..



echo "Creating Backend..."
mkdir -p backend
cd backend
npm init -y

# 安装后端依赖
npm install express cors body-parser sqlite3
npm install --save-dev nodemon supertest vitest

# 生成后端 .gitignore
cat <<EOF > .gitignore
node_modules
*.db
.env
coverage
EOF

# 配置 Backend package.json scripts
npm pkg set main="src/index.js"
npm pkg set scripts.dev="nodemon src/index.js"
npm pkg set scripts.start="node src/index.js"
npm pkg set scripts.test="vitest"

# 创建后端文件结构 (符合 metadata 目录结构)
mkdir -p src/database
mkdir -p src/routes
mkdir -p src/utils
mkdir -p test

# 创建 src/index.js
cat <<EOF > src/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

 
app.use(cors());
app.use(bodyParser.json());

 
require('./database/init_db');

 
app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

 
if (require.main === module) {
  app.listen(port, () => {
    console.log(\`Backend listening at http://localhost:\${port}\`);
  });
}

module.exports = app;
EOF

# 创建 src/database/init_db.js
cat <<EOF > src/database/init_db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;
EOF

cd ..

echo "============================================"
echo "项目初始化完成 (React + Express)"
echo "--------------------------------------------"
echo "前端启动: cd frontend && npm run dev"
echo "后端启动: cd backend && npm run dev"
echo "============================================"
