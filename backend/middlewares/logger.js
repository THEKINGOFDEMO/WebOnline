const logger = require('../utils/logger');

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  // 记录请求开始时间
  req._startTime = Date.now();

  // 记录原始end方法
  const originalEnd = res.end;

  // 重写end方法以记录响应信息
  res.end = function(chunk, encoding) {
    // 恢复原始end方法
    res.end = originalEnd;
    res.end(chunk, encoding);

    // 计算响应时间
    const responseTime = Date.now() - req._startTime;

    // 记录访问日志
    logger.access(req, 'API Request', {
      responseTime,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      query: req.query,
      params: req.params,
      // 不记录敏感信息
      body: req.method === 'POST' || req.method === 'PUT' ? '(hidden)' : undefined
    });
  };

  next();
};

/**
 * 审计日志中间件
 */
const auditLogger = (action) => {
  return (req, res, next) => {
    // 获取资源信息
    const resource = req.originalUrl.split('?')[0];
    
    // 记录审计日志
    logger.audit(req, action, resource, {
      params: req.params,
      query: req.query,
      // 不记录敏感信息
      body: req.method === 'POST' || req.method === 'PUT' ? '(hidden)' : undefined
    });

    next();
  };
};

module.exports = {
  requestLogger,
  auditLogger
}; 