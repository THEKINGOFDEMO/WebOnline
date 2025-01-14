const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['document', 'image', 'other'],
    required: true
  },
  size: {
    type: Number,  // 文件大小(KB)
    required: true
  }
});

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, '提交内容不能为空']
  },
  attachments: [attachmentSchema],
  score: {
    type: Number,
    min: [0, '分数不能为负'],
    default: null
  },
  comment: String,
  submitTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  }
});

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, '作业标题不能为空']
  },
  description: {
    type: String,
    required: [true, '作业描述不能为空']
  },
  deadline: {
    type: Date,
    required: [true, '截止时间不能为空']
  },
  totalScore: {
    type: Number,
    required: true,
    default: 100,
    min: [0, '总分不能为负']
  },
  attachments: [attachmentSchema],
  submissions: [submissionSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// 创建索引
assignmentSchema.index({ courseId: 1, deadline: 1 });
assignmentSchema.index({ courseId: 1, status: 1 });
assignmentSchema.index({ 'submissions.studentId': 1, 'submissions.status': 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment; 