/**
 * 自定义应用错误类
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误码定义
const ErrorCodes = {
  // 认证相关 (1xxx)
  UNAUTHORIZED: 1001,
  INVALID_TOKEN: 1002,
  TOKEN_EXPIRED: 1003,
  FORBIDDEN: 1004,

  // 用户相关 (2xxx)
  USER_NOT_FOUND: 2001,
  USER_EXISTS: 2002,
  INVALID_PASSWORD: 2003,
  INVALID_EMAIL: 2004,

  // 课程相关 (3xxx)
  COURSE_NOT_FOUND: 3001,
  CHAPTER_NOT_FOUND: 3002,
  ENROLLMENT_NOT_FOUND: 3003,
  INVALID_COURSE_STATUS: 3004,

  // 文件相关 (4xxx)
  FILE_TOO_LARGE: 4001,
  INVALID_FILE_TYPE: 4002,
  FILE_UPLOAD_ERROR: 4003,
  FILE_NOT_FOUND: 4004,

  // 数据验证相关 (5xxx)
  VALIDATION_ERROR: 5001,
  INVALID_INPUT: 5002,

  // 系统错误 (9xxx)
  INTERNAL_ERROR: 9001,
  DATABASE_ERROR: 9002,
  NETWORK_ERROR: 9003
};

module.exports = {
  AppError,
  ErrorCodes
}; 