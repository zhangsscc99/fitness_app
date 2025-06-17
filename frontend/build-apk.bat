@echo off
echo 🏗️  开始构建健身记录 APK...
echo.

echo 📦 Step 1: 构建 Web 应用...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Web 应用构建失败！
    pause
    exit /b 1
)
echo ✅ Web 应用构建成功！
echo.

echo 🔄 Step 2: 同步到 Android 项目...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ 同步失败！
    pause
    exit /b 1
)
echo ✅ 同步成功！
echo.

echo 🚀 Step 3: 打开 Android Studio...
call npx cap open android
echo.

echo 📱 接下来请在 Android Studio 中：
echo    1. 等待项目加载完成
echo    2. 点击 Build → Build Bundle(s)/APK(s) → Build APK(s)
echo    3. APK 文件将生成在：android\app\build\outputs\apk\debug\app-debug.apk
echo.

pause 