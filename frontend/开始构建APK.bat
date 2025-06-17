@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════╗
echo ║          健身记录 APK 构建工具          ║
echo ╚══════════════════════════════════════╝
echo.

echo 📱 欢迎使用健身记录 APK 构建工具！
echo.

echo 🔍 检查项目状态...
if not exist "dist" (
    echo 🔧 第一次构建，需要编译 Web 应用...
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Web 应用构建失败！请检查错误信息。
        pause
        exit /b 1
    )
    echo ✅ Web 应用构建成功！
) else (
    echo ✅ Web 应用已存在，跳过构建步骤
)
echo.

echo 🔄 同步项目到 Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ 同步失败！请检查 Capacitor 配置。
    pause
    exit /b 1
)
echo ✅ 同步成功！
echo.

echo 🚀 正在打开 Android Studio...
echo.
echo ⚠️  重要提示：
echo    1. 如果这是首次运行，请先安装 Android Studio
echo    2. 下载地址：https://developer.android.com/studio
echo    3. 安装后选择 "Standard" 安装选项
echo.

call npx cap open android
echo.

echo 📝 在 Android Studio 中构建 APK：
echo    ┌─────────────────────────────────────┐
echo    │ 1. 等待项目加载完成（首次较慢）        │
echo    │ 2. 菜单：Build → Build APK(s)        │
echo    │ 3. 等待构建完成                     │
echo    │ 4. 点击 "locate" 查看 APK 文件      │
echo    └─────────────────────────────────────┘
echo.

echo 📂 APK 文件位置：
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.

echo 📱 安装到手机：
echo    • 将 APK 传输到手机并安装
echo    • 或通过 USB 连接在 Android Studio 中直接运行
echo.

echo ✨ 完成！您的健身记录应用已准备好安装到安卓手机！
echo.
pause 