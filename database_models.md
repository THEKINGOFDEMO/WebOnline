# 数据库模型设计文档

## 1. 用户相关模型

### 1.1 用户表 (users)
```javascript
{
  _id: ObjectId,                    // 用户ID
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {                       // 加密存储
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  name: {                          // 真实姓名
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  avatar: {                        // 头像URL
    type: String,
    default: '/default-avatar.png'
  },
  status: {                        // 账号状态
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  lastLogin: {                     // 最后登录时间
    type: Date,
    default: null
  },
  createdAt: Date,                 // 创建时间
  updatedAt: Date                  // 更新时间
}
```

### 1.2 用户配置表 (user_settings)
```javascript
{
  _id: ObjectId,
  userId: {                        // 关联用户ID
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notification: {                  // 通知设置
    email: Boolean,                // 是否接收邮件通知
    assignment: Boolean,           // 是否接收作业通知
    exam: Boolean                  // 是否接收考试通知
  },
  theme: {                         // 界面主题设置
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 2. 课程相关模型

### 2.1 课程表 (courses)
```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  teacherId: {                     // 关联教师ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {                    // 课程封面
    type: String,
    required: true
  },
  category: {                      // 课程分类
    type: String,
    required: true,
    enum: ['programming', 'design', 'business', 'language', 'other']
  },
  level: {                         // 课程难度
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  price: {                         // 课程价格，0为免费
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  studentCount: {                  // 学生数量
    type: Number,
    default: 0
  },
  rating: {                        // 课程评分
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 课程章节表 (chapters)
```javascript
{
  _id: ObjectId,
  courseId: {                      // 关联课程ID
    type: ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  order: {                         // 章节顺序
    type: Number,
    required: true
  },
  content: {                       // 章节内容
    type: String,
    required: true
  },
  duration: {                      // 预计学习时长(分钟)
    type: Number,
    default: 0
  },
  resources: [{                    // 章节资源
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'document', 'other']
    },
    size: Number,                  // 文件大小(KB)
    duration: Number               // 视频时长(秒)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 课程选修表 (enrollments)
```javascript
{
  _id: ObjectId,
  courseId: {                      // 关联课程ID
    type: ObjectId,
    ref: 'Course',
    required: true
  },
  studentId: {                     // 关联学生ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  progress: {                      // 学习进度
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastStudyTime: Date,             // 最后学习时间
  completedChapters: [{            // 已完成章节
    chapterId: ObjectId,
    completedAt: Date
  }],
  status: {                        // 选课状态
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  createdAt: Date,                 // 选课时间
  updatedAt: Date
}
```

## 3. 作业和考试相关模型

### 3.1 作业表 (assignments)
```javascript
{
  _id: ObjectId,
  courseId: {                      // 关联课程ID
    type: ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  deadline: {                      // 截止时间
    type: Date,
    required: true
  },
  totalScore: {                    // 总分
    type: Number,
    required: true,
    default: 100
  },
  attachments: [{                  // 附件
    title: String,
    url: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 作业提交表 (assignment_submissions)
```javascript
{
  _id: ObjectId,
  assignmentId: {                  // 关联作业ID
    type: ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {                     // 关联学生ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  content: {                       // 提交内容
    type: String,
    required: true
  },
  attachments: [{                  // 提交的附件
    title: String,
    url: String,
    size: Number
  }],
  score: {                         // 得分
    type: Number,
    default: null
  },
  feedback: {                      // 教师反馈
    type: String,
    default: ''
  },
  status: {                        // 提交状态
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  },
  submitTime: {                    // 提交时间
    type: Date,
    default: Date.now
  },
  gradedTime: Date,                // 批改时间
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3 考试表 (exams)
```javascript
{
  _id: ObjectId,
  courseId: {                      // 关联课程ID
    type: ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  startTime: {                     // 开始时间
    type: Date,
    required: true
  },
  endTime: {                       // 结束时间
    type: Date,
    required: true
  },
  duration: {                      // 考试时长(分钟)
    type: Number,
    required: true
  },
  totalScore: {                    // 总分
    type: Number,
    required: true,
    default: 100
  },
  questions: [{
    type: {                        // 题目类型
      type: String,
      enum: ['single', 'multiple', 'essay'],
      required: true
    },
    content: {                     // 题目内容
      type: String,
      required: true
    },
    options: [{                    // 选项(选择题)
      label: String,
      content: String
    }],
    answer: String,                // 答案
    score: Number                  // 分值
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'ended'],
    default: 'draft'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 考试记录表 (exam_records)
```javascript
{
  _id: ObjectId,
  examId: {                        // 关联考试ID
    type: ObjectId,
    ref: 'Exam',
    required: true
  },
  studentId: {                     // 关联学生ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{                      // 答题记录
    questionId: ObjectId,
    answer: String,
    score: Number                  // 得分
  }],
  totalScore: {                    // 总得分
    type: Number,
    default: 0
  },
  startTime: Date,                 // 开始答题时间
  submitTime: Date,                // 提交时间
  status: {
    type: String,
    enum: ['ongoing', 'submitted', 'graded'],
    default: 'ongoing'
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 4. 通知和消息模型

### 4.1 通知表 (notifications)
```javascript
{
  _id: ObjectId,
  userId: {                        // 接收用户ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {                          // 通知类型
    type: String,
    enum: ['system', 'course', 'assignment', 'exam'],
    required: true
  },
  relatedId: ObjectId,             // 相关内容ID
  isRead: {                        // 是否已读
    type: Boolean,
    default: false
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 5. 统计和分析模型

### 5.1 学习记录表 (study_records)
```javascript
{
  _id: ObjectId,
  studentId: {                     // 关联学生ID
    type: ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {                      // 关联课程ID
    type: ObjectId,
    ref: 'Course',
    required: true
  },
  chapterId: {                     // 关联章节ID
    type: ObjectId,
    ref: 'Chapter',
    required: true
  },
  duration: Number,                // 学习时长(秒)
  progress: Number,                // 进度百分比
  createdAt: Date,
  updatedAt: Date
}
```

## 6. 索引设计

### 6.1 单字段索引
```javascript
// users表
users.index({ username: 1 }, { unique: true });
users.index({ email: 1 }, { unique: true });
users.index({ role: 1 });

// courses表
courses.index({ teacherId: 1 });
courses.index({ status: 1 });
courses.index({ category: 1 });

// chapters表
chapters.index({ courseId: 1, order: 1 });

// enrollments表
enrollments.index({ courseId: 1, studentId: 1 }, { unique: true });
enrollments.index({ studentId: 1, status: 1 });

// assignments表
assignments.index({ courseId: 1, deadline: 1 });

// exams表
exams.index({ courseId: 1, startTime: 1 });
```

### 6.2 复合索引
```javascript
// 课程搜索
courses.index({ title: 'text', description: 'text' });

// 学习记录查询
study_records.index({ studentId: 1, courseId: 1, createdAt: -1 });

// 作业提交查询
assignment_submissions.index({ assignmentId: 1, studentId: 1, status: 1 });

// 考试记录查询
exam_records.index({ examId: 1, studentId: 1, status: 1 });
```

## 7. 数据关联图
```
User ──┬── Course (teacherId)
       ├── Enrollment (studentId)
       ├── AssignmentSubmission (studentId)
       ├── ExamRecord (studentId)
       └── Notification (userId)

Course ──┬── Chapter (courseId)
         ├── Assignment (courseId)
         ├── Exam (courseId)
         └── Enrollment (courseId)

Assignment ── AssignmentSubmission (assignmentId)
Exam ── ExamRecord (examId)
``` 