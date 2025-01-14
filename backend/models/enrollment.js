const mongoose = require('mongoose');

const completedChapterSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const enrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, '进度不能小于0'],
    max: [100, '进度不能超过100']
  },
  lastStudyTime: {
    type: Date,
    default: null
  },
  completedChapters: [completedChapterSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  }
}, {
  timestamps: true
});

// 创建索引
enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });  // 确保学生不会重复选修同一门课程
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment; 