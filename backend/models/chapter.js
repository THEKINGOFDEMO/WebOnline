const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '资源标题不能为空']
  },
  url: {
    type: String,
    required: [true, '资源URL不能为空']
  },
  type: {
    type: String,
    enum: ['video', 'image', 'document', 'other'],
    required: true
  },
  size: {
    type: Number,  // 文件大小(KB)
    required: true
  },
  duration: {
    type: Number,  // 视频时长(秒)
    default: 0
  }
});

const chapterSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, '章节标题不能为空']
  },
  description: String,
  order: {
    type: Number,
    required: [true, '章节顺序不能为空']
  },
  content: {
    type: String,
    required: [true, '章节内容不能为空']
  },
  duration: {
    type: Number,  // 预计学习时长(分钟)
    default: 30
  },
  resources: [resourceSchema]
}, {
  timestamps: true
});

// 创建索引
chapterSchema.index({ courseId: 1, order: 1 }, { unique: true });  // 确保每个课程的章节顺序唯一
chapterSchema.index({ courseId: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter; 