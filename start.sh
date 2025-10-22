#!/bin/bash

# 12306铁路订票系统启动脚本
# 该脚本会同时启动前端和后端服务

echo "🚀 启动12306铁路订票系统..."
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查Go是否安装
if ! command -v go &> /dev/null; then
    echo "❌ 错误: 未找到Go，请先安装Go"
    exit 1
fi

# 检查前端依赖
echo "📦 检查前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi

# 启动前端服务
echo "🌐 启动前端服务..."
npm run dev &
FRONTEND_PID=$!
echo "前端服务已启动 (PID: $FRONTEND_PID)"

# 返回根目录
cd ..

# 启动后端服务
echo "⚙️  启动后端服务..."
cd backend
go run src/main.go &
BACKEND_PID=$!
echo "后端服务已启动 (PID: $BACKEND_PID)"

# 返回根目录
cd ..

echo "================================"
echo "✅ 服务启动完成!"
echo "🌐 前端地址: http://localhost:5173"
echo "⚙️  后端地址: http://localhost:8080"
echo "📋 前端PID: $FRONTEND_PID"
echo "📋 后端PID: $BACKEND_PID"
echo ""
echo "💡 使用说明:"
echo "   - 在浏览器中打开 http://localhost:5173 访问系统"
echo "   - 按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; echo "✅ 所有服务已停止"; exit 0' INT

# 保持脚本运行
echo "⏳ 服务正在运行中，按 Ctrl+C 停止..."
wait