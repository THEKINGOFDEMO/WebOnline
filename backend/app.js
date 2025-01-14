const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const { AppError, ErrorCodes } = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/error');
const { requestLogger, auditLogger } = require('./middlewares/logger');
const logger = require('./utils/logger');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const chapterRoutes = require('./routes/chapters');
const assignmentRoutes = require('./routes/assignments');
const enrollmentRoutes = require('./routes/enrollments');
const fileRoutes = require('./routes/files');
const studyRoutes = require('./routes/study');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 连接数据库
connectDB();

// 基础中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // 允许跨域访问资源
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(compression());  // gzip压缩
app.use(express.json());  // 解析JSON请求体
app.use(express.urlencoded({ extended: true }));  // 解析URL编码的请求体

// 添加请求日志中间件
app.use(requestLogger);

// 静态文件服务
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // 缓存一天
  etag: true    // 使用ETag
}));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', chapterRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/study', studyRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Online Learning Platform API' });
});

// 404错误处理
app.use((req, res, next) => {
  next(new AppError('请求的资源不存在', 404, ErrorCodes.INVALID_INPUT));
});

// 全局错误处理
app.use(globalErrorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.system(`Server is running on port ${PORT}`);
  logger.system(`Environment: ${process.env.NODE_ENV}`);
});
