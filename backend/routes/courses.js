const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const { upload } = require('../utils/upload');
const { auditLogger } = require('../middlewares/logger');
const { COURSE_ACTIONS } = require('../utils/auditConstants');
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  updateCoverImage
} = require('../controllers/courseController');
const {
  createCourseValidator,
  updateCourseValidator,
  updateCourseStatusValidator
} = require('../middlewares/validators/course.validator');

// 获取课程列表
router.get('/', protect, getCourses);

// 获取课程详情
router.get('/:id', getCourse);

// 创建课程（需要教师或管理员权限）
router.post(
  '/',
  protect,
  restrictTo('teacher', 'admin'),
  upload.single('coverImage'),
  createCourseValidator,
  auditLogger(COURSE_ACTIONS.CREATE),
  createCourse
);

// 更新课程信息（需要教师或管理员权限）
router.put(
  '/:id',
  protect,
  restrictTo('teacher', 'admin'),
  updateCourseValidator,
  auditLogger(COURSE_ACTIONS.UPDATE),
  updateCourse
);

// 更新课程状态（需要教师或管理员权限）
router.patch(
  '/:id/status',
  protect,
  restrictTo('teacher', 'admin'),
  updateCourseStatusValidator,
  auditLogger(COURSE_ACTIONS.STATUS_CHANGE),
  updateCourseStatus
);

// 更新课程封面（需要教师或管理员权限）
router.patch(
  '/:id/cover',
  protect,
  restrictTo('teacher', 'admin'),
  upload.single('coverImage'),
  auditLogger(COURSE_ACTIONS.COVER_UPDATE),
  updateCoverImage
);

// 删除课程（需要教师或管理员权限）
router.delete(
  '/:id',
  protect,
  restrictTo('teacher', 'admin'),
  auditLogger(COURSE_ACTIONS.DELETE),
  deleteCourse
);

module.exports = router; 