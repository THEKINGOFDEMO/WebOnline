const { body } = require('express-validator');
const { validate } = require('./validator');

// 创建课程验证规则
exports.createCourseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('课程标题不能为空')
    .isLength({ min: 2, max: 100 }).withMessage('课程标题长度必须在2-100个字符之间'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('课程描述不能为空')
    .isLength({ min: 10, max: 2000 }).withMessage('课程描述长度必须在10-2000个字符之间'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('课程分类不能为空'),
  
  body('level')
    .trim()
    .notEmpty().withMessage('课程难度不能为空')
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('课程难度必须是 beginner、intermediate 或 advanced'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('课程价格必须大于等于0'),
  
  validate
];

// 更新课程验证规则
exports.updateCourseValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('课程标题长度必须在2-100个字符之间'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('课程描述长度必须在10-2000个字符之间'),
  
  body('category')
    .optional()
    .trim(),
  
  body('level')
    .optional()
    .trim()
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('课程难度必须是 beginner、intermediate 或 advanced'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('课程价格必须大于等于0'),
  
  validate
];

// 更新课程状态验证规则
exports.updateCourseStatusValidator = [
  body('status')
    .trim()
    .notEmpty().withMessage('课程状态不能为空')
    .isIn(['draft', 'published', 'closed']).withMessage('课程状态必须是 draft、published 或 closed'),
  
  validate
]; 