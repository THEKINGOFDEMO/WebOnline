const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '课程标题不能为空'],
    trim: true,
    maxlength: [100, '课程标题最多100个字符']
  },
  description: {
    type: String,
    required: [true, '课程描述不能为空'],
    maxlength: [1000, '课程描述最多1000个字符']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String,
    required: [true, '课程封面不能为空']
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'design', 'business', 'language', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  price: {
    type: Number,
    default: 0,
    min: [0, '课程价格不能为负']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  studentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 创建索引
courseSchema.index({ title: 'text', description: 'text' });  // 全文索引
courseSchema.index({ category: 1 });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ level: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 