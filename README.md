# 离线健身记录App

一个基于Vue3 + SpringBoot的离线健身记录应用

## 功能特性

- 🏋️ 记录健身动作、组数、重量、次数
- 📊 1RM最大力量计算和记录
- 📱 响应式设计，完美适配手机端
- 💾 完全离线使用，数据本地保存
- ⚡ PWA技术，接近原生app体验
- 🔄 可通过Capacitor转换为安卓应用

## 技术栈


##
### 前端
- Vue 3 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- PWA (Progressive Web App)
- IndexedDB 本地数据存储

### 后端
- SpringBoot 3.x
- H2 数据库 (本地文件存储)
- RESTful API

## 项目结构

```
fitness-app/
├── frontend/          # Vue前端项目
│   ├── src/
│   ├── public/
│   └── ...
├── backend/           # SpringBoot后端项目
│   ├── src/
│   ├── pom.xml
│   └── ...
└── README.md
```

## 开发指南

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 后端开发
```bash
cd backend
./mvnw spring-boot:run
```

### 构建部署
```bash
# 前端打包
cd frontend
npm run build

# 后端打包
cd backend
./mvnw clean package
```

## 功能模块

1. **健身记录** - 记录每次训练的动作、组数、次数、重量
2. **动作管理** - 管理和分类健身动作
3. **1RM计算** - 自动计算和记录单次最大重量
4. **训练统计** - 训练进度和数据分析
5. **离线同步** - 本地数据管理和备份 