# 健身记录 APK 构建指南

## 🎯 方式一：使用 Android Studio（推荐）

1. **确保 Android Studio 已打开**
   ```bash
   npx cap open android
   ```

2. **在 Android Studio 中构建 APK**
   - 等待项目加载完成
   - 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 等待构建完成
   - APK 文件将生成在：`android/app/build/outputs/apk/debug/app-debug.apk`

3. **安装到手机**
   - 将 APK 文件传输到手机
   - 在手机上启用"未知来源"安装
   - 点击 APK 文件进行安装

## 🚀 方式二：命令行构建（需要配置环境）

1. **构建调试版 APK**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

2. **构建发布版 APK（需要签名）**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## 📱 应用功能

- ✅ 完全离线工作
- ✅ 训练记录追踪
- ✅ 1RM 计算和历史记录
- ✅ 动作管理
- ✅ 统计数据
- ✅ PWA 功能

## 🔧 开发流程

每次修改代码后：

1. **重新构建 Web 应用**
   ```bash
   npm run build
   ```

2. **同步到 Android**
   ```bash
   npx cap sync android
   ```

3. **重新构建 APK**
   ```bash
   npx cap open android
   ```

## 📋 系统要求

- Node.js 16+
- Android Studio
- Java 11 或更高版本

## 🐛 常见问题

1. **如果构建失败**
   - 确保 Android SDK 已安装
   - 检查 Java 版本
   - 清理并重新构建：`cd android && ./gradlew clean`

2. **APK 文件位置**
   - 调试版：`android/app/build/outputs/apk/debug/app-debug.apk`
   - 发布版：`android/app/build/outputs/apk/release/app-release.apk`

## 🚀 下一步

如果您想发布到 Google Play Store，您需要：
1. 创建签名密钥
2. 配置发布构建
3. 优化 APK 大小
4. 添加应用图标和启动画面 