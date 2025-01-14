const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '附件标题不能为空']
  },
  url: {
    type: String,
    required: [true, '附件URL不能为空']
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    default: 'other'
  },
  size: {
    type: Number,
    required: [true, '附件大小不能为空']
  },
  filename: {
    type: String,
    required: [true, '文件名不能为空']
  }
}, {
  _id: true,
  timestamps: true
});

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, '作业ID不能为空']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '学生ID不能为空']
  },
  content: {
    type: String,
    required: [true, '提交内容不能为空']
  },
  attachments: [attachmentSchema],
  score: {
    type: Number,
    min: [0, '分数不能小于0'],
    max: [100, '分数不能大于100']
  },
  comment: {
    type: String
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  },
  submitTime: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
submissionSchema.index({ assignment: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission; 