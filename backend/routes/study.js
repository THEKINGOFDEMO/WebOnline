const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const {
  getChapterStudyStatus,
  startStudyChapter,
  updateStudyProgress,
  getCourseStudyStats,
  completeChapter
} = require('../controllers/studyController');

// 获取章节学习状态
router.get(
  '/chapters/:chapterId/study-status',
  protect,
  restrictTo('student'),
  getChapterStudyStatus
);

// 开始学习章节
router.post(
  '/chapters/:chapterId/start',
  protect,
  restrictTo('student'),
  startStudyChapter
);

// 更新学习进度
router.put(
  '/chapters/:chapterId/progress',
  protect,
  restrictTo('student'),
  updateStudyProgress
);

// 完成章节学习
router.post(
  '/chapters/:chapterId/complete',
  protect,
  restrictTo('student'),
  completeChapter
);

// 获取课程学习统计
router.get(
  '/courses/:courseId/study-stats',
  protect,
  restrictTo('student'),
  getCourseStudyStats
);

module.exports = router; 