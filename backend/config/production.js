module.exports = {
  // 数据库配置
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/online_learning',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-production-secret-key',
    expiresIn: '7d'
  },
  
  // 文件上传配置
  upload: {
    baseDir: 'uploads',
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    }
  },
  
  // 日志配置
  log: {
    dir: 'logs',
    level: 'info'
  },
  
  // 跨域配置
  cors: {
    origin: process.env.FRONTEND_URL || 'http://your-domain.com',
    credentials: true
  }
} 