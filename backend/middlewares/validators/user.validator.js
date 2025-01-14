const { body } = require('express-validator');
const { validate } = require('./validator');

// 更新用户信息验证规则
exports.updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('姓名长度必须在2-50个字符之间'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('邮箱格式不正确'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  
  validate
];

// 更新用户设置验证规则
exports.updateSettingsValidator = [
  body('notification.email')
    .optional()
    .isBoolean().withMessage('邮件通知设置必须是布尔值'),
  
  body('notification.assignment')
    .optional()
    .isBoolean().withMessage('作业通知设置必须是布尔值'),
  
  body('notification.exam')
    .optional()
    .isBoolean().withMessage('考试通知设置必须是布尔值'),
  
  body('theme')
    .optional()
    .isIn(['light', 'dark']).withMessage('主题必须是 light 或 dark'),
  
  validate
]; 