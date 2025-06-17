# Android 开发环境安装指南

## 🚀 快速开始 - 所需工具

### 1. 安装 Android Studio

1. **下载 Android Studio**
   - 访问：https://developer.android.com/studio
   - 下载 Windows 版本的 Android Studio
   - 文件大小约 1GB

2. **安装 Android Studio**
   - 运行下载的安装程序
   - 选择 "Standard" 安装类型
   - 等待下载和安装 Android SDK

3. **验证安装**
   - 启动 Android Studio
   - 选择 "More Actions" → "SDK Manager"
   - 确保已安装 "Android API 34" 或最新版本

### 2. 设置环境变量（可选）

**方法 1：通过系统设置**
1. 右键 "此电脑" → "属性" → "高级系统设置"
2. 点击 "环境变量"
3. 新建系统变量：
   - 变量名：`ANDROID_HOME`
   - 变量值：`C:\Users\[您的用户名]\AppData\Local\Android\Sdk`

**方法 2：使用 Android Studio（推荐）**
- 直接通过 Android Studio 构建，无需设置环境变量

## 📱 构建 APK

### 🎯 方法一：使用 Android Studio（最简单）

1. **打开项目**
   ```bash
   # 在 frontend 目录下运行
   npx cap open android
   ```

2. **等待项目加载**
   - Android Studio 会自动下载依赖
   - 首次可能需要几分钟

3. **构建 APK**
   - 菜单：`Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 等待构建完成
   - 点击弹出的 "locate" 链接找到 APK 文件

### 🛠️ 方法二：命令行构建（需要配置环境变量）

```bash
cd android
.\gradlew assembleDebug
```

## 📂 APK 文件位置

构建成功后，APK 文件位于：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 安装到手机

1. **启用开发者选项**
   - 设置 → 关于手机 → 连续点击版本号 7 次
   - 返回设置 → 开发者选项 → 启用 "USB 调试"

2. **安装 APK**
   - 方法 1：通过 USB 连接手机，在 Android Studio 中点击 "Run"
   - 方法 2：将 APK 文件传输到手机，直接安装
   - 方法 3：通过 ADB 安装：`adb install app-debug.apk`

## 🔧 故障排除

### 问题 1：SDK location not found
**解决方案：**
- 确保已安装 Android Studio
- 或设置 ANDROID_HOME 环境变量

### 问题 2：路径包含中文字符
**解决方案：**
- 已在 `gradle.properties` 中添加 `android.overridePathCheck=true`

### 问题 3：Build failed
**解决方案：**
1. 清理项目：`.\gradlew clean`
2. 重新构建：`.\gradlew assembleDebug`

## 🎨 自定义应用

### 应用图标
- 替换 `android/app/src/main/res/mipmap-*/ic_launcher.png`

### 应用名称
- 修改 `android/app/src/main/res/values/strings.xml`

### 应用 ID
- 修改 `capacitor.config.ts` 中的 `appId`

## 📦 发布版本

构建发布版 APK（需要签名）：
```bash
.\gradlew assembleRelease
```

## 💡 小贴士

1. **首次构建较慢**：Android Studio 需要下载很多依赖
2. **保持网络连接**：下载 SDK 和依赖需要网络
3. **磁盘空间**：确保至少有 10GB 空闲空间
4. **内存要求**：建议 8GB+ RAM 