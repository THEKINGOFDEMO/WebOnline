const { validationResult } = require('express-validator');

// 统一的验证处理中间件
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg
  }));

  return res.status(400).json({
    success: false,
    errors: extractedErrors
  });
}; 