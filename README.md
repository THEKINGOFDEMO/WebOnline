# 在线学习平台

一个基于 Node.js 和 Vue.js 的在线学习平台，支持课程管理、用户管理、作业提交等功能。

## 功能特点

- 用户管理（学生、教师、管理员）
- 课程管理
- 作业管理
- 在线提交和评分
- 学习进度跟踪
- 系统管理功能

## 技术栈

### 后端
- Node.js
- Express
- MongoDB
- JWT认证

### 前端
- Vue.js
- Element UI
- Axios

## 安装部署

1. 克隆仓库
```bash
git clone [仓库地址]
cd online-learning-platform
```

2. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

3. 配置环境变量
```bash
# 后端配置
cd backend
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

4. 启动服务
```bash
# 启动后端
cd backend
npm start

# 启动前端（开发模式）
cd frontend
npm run serve

# 构建前端（生产模式）
npm run build
```

## 开发指南

1. 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支
- feature/*: 新功能分支
- bugfix/*: 修复分支

2. 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 注意事项

1. 确保 MongoDB 服务已启动
2. 首次运行需要初始化管理员账户
3. 生产环境部署前请修改相关配置
4. 注意保护 .env 文件中的敏感信息

## 许可证

MIT License 