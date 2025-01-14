const { body } = require('express-validator');
const { validate } = require('./validator');

// 创建章节验证规则
exports.createChapterValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('章节标题不能为空')
    .isLength({ min: 2, max: 100 }).withMessage('章节标题长度必须在2-100个字符之间'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('章节描述不能超过500个字符'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('章节内容不能为空'),
  
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('章节顺序必须是非负整数'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('章节时长必须是非负整数'),
  
  validate
];

// 更新章节验证规则
exports.updateChapterValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('章节标题长度必须在2-100个字符之间'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('章节描述不能超过500个字符'),
  
  body('content')
    .optional()
    .trim(),
  
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('章节顺序必须是非负整数'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('章节时长必须是非负整数'),
  
  validate
]; 