const { body } = require('express-validator');
const { validate } = require('./validator');

// 注册验证规则
exports.registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 2, max: 20 }).withMessage('用户名长度必须在2-20个字符之间'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度必须在6-20个字符之间'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  
  body('role')
    .optional()
    .isIn(['student', 'teacher']).withMessage('角色必须是 student 或 teacher'),
  
  validate
];

// 登录验证规则
exports.loginValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空'),
  
  validate
];

// 重置密码验证规则
exports.resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  
  validate
];

// 更新密码验证规则
exports.updatePasswordValidator = [
  body('oldPassword')
    .trim()
    .notEmpty().withMessage('原密码不能为空'),
  
  body('newPassword')
    .trim()
    .notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度必须在6-20个字符之间'),
  
  validate
]; 