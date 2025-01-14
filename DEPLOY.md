# 在线学习平台部署指南

## 环境要求

- Node.js >= 16
- MongoDB >= 4.4
- Nginx >= 1.18
- PM2 (用于进程管理)

## 部署步骤

### 1. 安装依赖

```bash
# 安装 PM2
npm install -g pm2

# 后端依赖安装
cd backend
npm install --production

# 前端依赖安装
cd frontend
npm install
```

### 2. 构建前端

```bash
cd frontend
npm run build
```

构建完成后，生成的文件在 `dist` 目录中。

### 3. 配置环境变量

创建 `.env` 文件在后端根目录：

```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/online_learning

# JWT密钥
JWT_SECRET=your-secret-key

# 服务器配置
PORT=8080
HOST=0.0.0.0

# 前端地址
FRONTEND_URL=http://your-domain.com
```

### 4. 配置 Nginx

```nginx
# 前端配置
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 反向代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 上传文件代理
    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

### 5. 启动服务

```bash
# 启动后端服务
cd backend
pm2 start app.js --name online-learning-api

# 查看日志
pm2 logs online-learning-api

# 监控服务状态
pm2 monit
```

### 6. 数据库备份

建议设置定时备份：

```bash
# 创建备份脚本
mkdir -p /backup/mongodb
mongodump --db online_learning --out /backup/mongodb/$(date +%Y%m%d)

# 设置定时任务 (每天凌晨3点备份)
0 3 * * * /path/to/backup-script.sh
```

## 维护指南

### 1. 日志查看

- 应用日志：`pm2 logs online-learning-api`
- Nginx 日志：`/var/log/nginx/access.log` 和 `error.log`
- MongoDB 日志：`/var/log/mongodb/mongod.log`

### 2. 常见问题处理

1. 服务无法启动
   - 检查环境变量配置
   - 检查 MongoDB 连接
   - 查看错误日志

2. 上传失败
   - 检查上传目录权限
   - 检查磁盘空间
   - 检查文件大小限制

3. 性能问题
   - 使用 `pm2 monit` 监控内存使用
   - 检查数据库索引
   - 检查日志级别

### 3. 更新部署

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新构建前端
cd frontend
npm run build

# 重启服务
pm2 restart online-learning-api
```

## 安全建议

1. 启用 HTTPS
2. 配置防火墙
3. 定期更新依赖包
4. 启用数据库认证
5. 设置文件上传限制
6. 配置日志轮转
7. 定期备份数据

## 监控建议

1. 使用 PM2 监控进程
2. 配置服务器监控
3. 设置异常告警
4. 监控数据库性能
5. 监控磁盘使用率

如需帮助，请联系技术支持。 