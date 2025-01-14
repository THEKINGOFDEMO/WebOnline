const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const { upload } = require('../utils/upload');
const {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  uploadAttachment,
  deleteAttachment,
  getAssignments,
  getSubmissions,
  getStudentAssignments,
  getAssignmentSubmissions
} = require('../controllers/assignmentController');

// 获取作业列表（支持分页和筛选）
router.get('/', protect, getAssignments);

// 获取学生的作业列表
router.get('/student', protect, restrictTo('student'), getStudentAssignments);

// 获取课程作业列表
router.get('/course/:courseId', protect, getCourseAssignments);

// 创建作业
router.post('/course/:courseId', protect, restrictTo('teacher', 'admin'), upload.array('files'), createAssignment);

// 获取作业详情
router.get('/:id', protect, getAssignment);

// 更新作业
router.put('/:id', protect, restrictTo('teacher', 'admin'), updateAssignment);

// 更新作业状态
router.patch('/:id/status', protect, restrictTo('teacher', 'admin'), updateAssignmentStatus);

// 删除作业
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteAssignment);

// 提交作业
router.post('/:id/submit', protect, restrictTo('student'), upload.single('file'), submitAssignment);

// 批改作业
router.put('/:id/submissions/:submissionId/grade', protect, restrictTo('teacher', 'admin'), gradeSubmission);

// 上传作业附件
router.post('/:id/attachments', protect, restrictTo('teacher', 'admin'), uploadAttachment);

// 删除作业附件
router.delete('/:id/attachments/:attachmentId', protect, restrictTo('teacher', 'admin'), deleteAttachment);

// 获取作业提交记录
router.get('/:id/submissions', protect, restrictTo('teacher', 'admin'), getAssignmentSubmissions);

module.exports = router; 