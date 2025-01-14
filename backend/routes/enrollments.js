const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect, restrictTo } = require('../middlewares/auth');
const { auditLogger } = require('../middlewares/logger');
const { ENROLLMENT_ACTIONS } = require('../utils/auditConstants');

// 选修课程（需要学生权限）
router.post(
  '/courses/:courseId/enroll', 
  protect, 
  restrictTo('student'),
  auditLogger(ENROLLMENT_ACTIONS.ENROLL),
  enrollmentController.enrollCourse
);

// 获取学生的选课列表
router.get(
  '/', 
  protect, 
  enrollmentController.getStudentCourses
);

// 更新选课状态（退课、完成课程等）
router.put(
  '/:id/status', 
  protect,
  auditLogger(ENROLLMENT_ACTIONS.UPDATE_STATUS),
  enrollmentController.updateEnrollmentStatus
);

// 更新学习进度
router.put(
  '/:id/progress', 
  protect, 
  restrictTo('student'),
  auditLogger(ENROLLMENT_ACTIONS.UPDATE_PROGRESS),
  enrollmentController.updateProgress
);

// 获取课程的学生列表（需要教师权限）
router.get(
  '/courses/:courseId/students',
  protect,
  restrictTo('teacher', 'admin'),
  enrollmentController.getCourseStudents
);

// 获取学生的学习详情（需要教师权限）
router.get(
  '/:id/detail',
  protect,
  restrictTo('teacher', 'admin'),
  enrollmentController.getEnrollmentDetail
);

module.exports = router; 