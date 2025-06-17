#!/bin/bash

echo "🏋️ 启动离线健身记录应用..."

# 检查是否安装了必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装"
        exit 1
    fi
}

# 检查Node.js和npm
check_command "node"
check_command "npm"

# 检查Java
if ! command -v java &> /dev/null; then
    echo "❌ Java 未安装，请先安装 Java 17 或更高版本"
    exit 1
fi

# 启动后端
echo "🚀 启动SpringBoot后端..."
cd backend
if [ ! -f "target/fitness-tracker-backend-1.0.0.jar" ]; then
    echo "📦 首次运行，正在构建后端..."
    ./mvnw clean package -DskipTests
fi

nohup java -jar target/fitness-tracker-backend-1.0.0.jar > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端已启动 (PID: $BACKEND_PID)"
cd ..

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 启动前端
echo "🚀 启动Vue前端..."
cd frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装前端依赖..."
    npm install
fi

echo "✅ 前端开发服务器启动中..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "🎉 应用启动成功！"
echo ""
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:8080/api"
echo "🗄️  数据库控制台: http://localhost:8080/api/h2-console"
echo ""
echo "💡 提示:"
echo "   - 前端支持PWA，可以添加到手机桌面"
echo "   - 数据完全本地存储，无需网络连接"
echo "   - 使用 Ctrl+C 停止服务"
echo ""
echo "📋 进程信息:"
echo "   - 后端进程 PID: $BACKEND_PID"
echo "   - 前端进程 PID: $FRONTEND_PID"

# 等待用户按Ctrl+C
trap 'echo ""; echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ 服务已停止"; exit 0' INT

echo "按 Ctrl+C 停止服务"
wait 