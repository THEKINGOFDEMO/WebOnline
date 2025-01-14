const { AppError, ErrorCodes } = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * 开发环境错误处理
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.errorCode || ErrorCodes.INTERNAL_ERROR,
      message: err.message,
      stack: err.stack,
      status: err.status
    }
  });
};

/**
 * 生产环境错误处理
 */
const sendErrorProd = (err, res) => {
  // 可操作的错误，发送详细信息
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode || ErrorCodes.INTERNAL_ERROR,
        message: err.message
      }
    });
  } 
  // 编程错误，不泄露错误详情
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: '服务器内部错误'
      }
    });
  }
};

/**
 * 错误处理中间件
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    console.log('ValidationError:', err);
    err = new AppError(err.message, 400, ErrorCodes.VALIDATION_ERROR);
  }
  else if (err.name === 'CastError') {
    console.log('CastError:', {
      value: err.value,
      path: err.path,
      kind: err.kind,
      model: err.model?.modelName,
      reason: err.reason
    });
    err = new AppError(`无效的ID格式: ${err.path}=${err.value}`, 400, ErrorCodes.INVALID_INPUT);
  }
  else if (err.code === 11000 && err.keyValue) {
    console.log('DuplicateError:', err);
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`${field} 已存在`, 400, ErrorCodes.VALIDATION_ERROR);
  }
  else if (err.name === 'MulterError') {
    console.log('MulterError:', err);
    if (err.message === 'File too large') {
      err = new AppError('文件大小超过限制', 400, ErrorCodes.FILE_TOO_LARGE);
    } else {
      err = new AppError('文件上传失败', 400, ErrorCodes.FILE_UPLOAD_ERROR);
    }
  }
  else if (err.name === 'JsonWebTokenError') {
    console.log('JsonWebTokenError:', err);
    err = new AppError('无效的token', 401, ErrorCodes.INVALID_TOKEN);
  }
  else if (err.name === 'TokenExpiredError') {
    console.log('TokenExpiredError:', err);
    err = new AppError('token已过期', 401, ErrorCodes.TOKEN_EXPIRED);
  }
  else {
    console.log('UnhandledError:', err);
  }

  // 记录错误日志
  logger.error(err, req);

  // 根据环境发送不同的错误响应
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
}; 