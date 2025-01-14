const { body } = require('express-validator');
const { validate } = require('./validator');

// 创建作业验证规则
exports.createAssignmentValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('作业标题不能为空')
    .isLength({ min: 2, max: 100 }).withMessage('作业标题长度必须在2-100个字符之间'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('作业描述不能为空')
    .isLength({ min: 10, max: 2000 }).withMessage('作业描述长度必须在10-2000个字符之间'),
  
  body('deadline')
    .notEmpty().withMessage('截止日期不能为空')
    .isISO8601().withMessage('截止日期格式不正确'),
  
  body('totalScore')
    .notEmpty().withMessage('总分不能为空')
    .isInt({ min: 0, max: 100 }).withMessage('总分必须在0-100之间'),
  
  body('maxAttempts')
    .optional()
    .isInt({ min: 1 }).withMessage('最大提交次数必须大于0'),
  
  validate
];

// 提交作业验证规则
exports.submitAssignmentValidator = [
  body('content')
    .trim()
    .notEmpty().withMessage('提交内容不能为空')
    .isLength({ max: 5000 }).withMessage('提交内容不能超过5000个字符'),
  
  validate
];

// 评分验证规则
exports.gradeAssignmentValidator = [
  body('score')
    .notEmpty().withMessage('分数不能为空')
    .isFloat({ min: 0 }).withMessage('分数必须大于等于0')
    .custom((value, { req }) => {
      if (value > req.assignment.totalScore) {
        throw new Error('分数不能超过作业总分');
      }
      return true;
    }),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('评语不能超过500个字符'),
  
  validate
]; 