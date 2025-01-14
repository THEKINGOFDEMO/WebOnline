const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const { upload } = require('../utils/upload');
const {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
  uploadResource,
  deleteResource
} = require('../controllers/chapterController');
const {
  createChapterValidator,
  updateChapterValidator
} = require('../middlewares/validators/chapter.validator');

// 获取课程的所有章节
router.get('/courses/:courseId/chapters', protect, getChapters);

// 获取章节详情
router.get('/chapters/:id', protect, getChapter);

// 创建章节（需要教师或管理员权限）
router.post(
  '/courses/:courseId/chapters',
  protect,
  restrictTo('teacher', 'admin'),
  createChapterValidator,
  createChapter
);

// 更新章节（需要教师或管理员权限）
router.put(
  '/chapters/:id',
  protect,
  restrictTo('teacher', 'admin'),
  updateChapterValidator,
  updateChapter
);

// 上传章节资源（需要教师或管理员权限）
router.post(
  '/chapters/:id/resources',
  protect,
  restrictTo('teacher', 'admin'),
  upload.single('resource'),
  uploadResource
);

// 删除章节资源（需要教师或管理员权限）
router.delete(
  '/chapters/:id/resources/:resourceId',
  protect,
  restrictTo('teacher', 'admin'),
  deleteResource
);

// 删除章节（需要教师或管理员权限）
router.delete(
  '/chapters/:id',
  protect,
  restrictTo('teacher', 'admin'),
  deleteChapter
);

module.exports = router; 