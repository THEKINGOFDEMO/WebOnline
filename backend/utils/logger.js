const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 访问日志传输器
const accessTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'access', '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// 错误日志传输器
const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error', '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

// 审计日志传输器
const auditTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'audit', '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info'
});

// 创建日志记录器
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    accessTransport,
    errorTransport,
    auditTransport
  ]
});

// 开发环境下添加控制台输出
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 访问日志
const access = (req, message, data = {}) => {
  logger.info(message, {
    type: 'access',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.headers['user-agent'],
    ...data
  });
};

// 错误日志
const error = (err, req = null) => {
  const logData = {
    type: 'error',
    errorCode: err.errorCode,
    stack: err.stack
  };

  if (req) {
    logData.method = req.method;
    logData.url = req.originalUrl;
    logData.ip = req.ip;
    logData.userId = req.user?.id;
  }

  logger.error(err.message, logData);
};

// 审计日志
const audit = (req, action, resource, details = {}) => {
  logger.info(`${action} ${resource}`, {
    type: 'audit',
    action,
    resource,
    userId: req.user?.id,
    userRole: req.user?.role,
    ip: req.ip,
    ...details
  });
};

// 系统日志
const system = (message, data = {}) => {
  logger.info(message, {
    type: 'system',
    ...data
  });
};

module.exports = {
  access,
  error,
  audit,
  system
}; 