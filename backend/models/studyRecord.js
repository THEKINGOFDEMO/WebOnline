const mongoose = require('mongoose');

const studyRecordSchema = new mongoose.Schema({
  // 关联的学生
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 关联的章节
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  // 关联的课程
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // 学习状态：not_started（未开始）, in_progress（学习中）, completed（已完成）
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  // 学习进度（百分比）
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // 最后学习时间
  lastStudyTime: {
    type: Date,
    default: Date.now
  },
  // 完成时间
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 创建复合索引
studyRecordSchema.index({ studentId: 1, chapterId: 1 }, { unique: true });

module.exports = mongoose.model('StudyRecord', studyRecordSchema); 