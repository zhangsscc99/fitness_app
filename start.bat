@echo off
echo 🏋️ 启动离线健身记录应用...

REM 检查Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java 未安装，请先安装 Java 17 或更高版本
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 启动后端
echo 🚀 启动SpringBoot后端...
cd backend

if not exist "target\fitness-tracker-backend-1.0.0.jar" (
    echo 📦 首次运行，正在构建后端...
    call mvnw.cmd clean package -DskipTests
)

start /b java -jar target\fitness-tracker-backend-1.0.0.jar > ..\backend.log 2>&1
echo ✅ 后端已启动

cd ..

REM 等待后端启动
echo ⏳ 等待后端启动...
timeout /t 5 /nobreak >nul

REM 启动前端
echo 🚀 启动Vue前端...
cd frontend

if not exist "node_modules" (
    echo 📦 首次运行，正在安装前端依赖...
    call npm install
)

echo ✅ 前端开发服务器启动中...
start /b npm run dev

cd ..

echo.
echo 🎉 应用启动成功！
echo.
echo 📱 前端地址: http://localhost:3000
echo 🔧 后端API: http://localhost:8080/api
echo 🗄️  数据库控制台: http://localhost:8080/api/h2-console
echo.
echo 💡 提示:
echo    - 前端支持PWA，可以添加到手机桌面
echo    - 数据完全本地存储，无需网络连接
echo    - 关闭此窗口或按 Ctrl+C 停止服务
echo.

pause 