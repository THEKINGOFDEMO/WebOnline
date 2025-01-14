const mongoose = require('mongoose');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Chapter = require('../models/chapter');
const Assignment = require('../models/assignment');
const StudyRecord = require('../models/studyRecord');
const Submission = require('../models/submission');

// 选修课程
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;

    // 检查课程是否存在且已发布
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: '该课程尚未发布'
      });
    }

    // 检查是否已经选修过该课程
    const existingEnrollment = await Enrollment.findOne({
      courseId,
      studentId,
      status: { $ne: 'dropped' }  // 排除已退课的记录
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: '您已选修过该课程'
      });
    }

    // 创建选课记录
    const enrollment = await Enrollment.create({
      courseId,
      studentId,
      status: 'active',
      lastStudyTime: new Date()
    });

    // 更新课程学生数量
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentCount: 1 }
    });

    res.status(201).json({
      success: true,
      enrollment
    });
  } catch (error) {
    // 处理唯一索引冲突
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '您已选修过该课程'
      });
    }
    res.status(500).json({
      success: false,
      message: '选课失败',
      error: error.message
    });
  }
};

// 获取学生的选课列表
exports.getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const status = req.query.status;

    // 构建查询条件
    const query = { studentId };
    if (status) {
      query.status = status;
    }

    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'courseId',
        select: 'title description coverImage teacherId',
        populate: {
          path: 'teacherId',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取选课列表失败',
      error: error.message
    });
  }
};

// 更新选课状态
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enrollmentId = req.params.id;

    // 检查选课记录是否存在
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '选课记录不存在'
      });
    }

    // 检查是否是本人的选课记录
    if (enrollment.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限修改此选课记录'
      });
    }

    // 如果是退课操作，更新课程学生数量
    if (status === 'dropped' && enrollment.status !== 'dropped') {
      await Course.findByIdAndUpdate(enrollment.courseId, {
        $inc: { studentCount: -1 }
      });
    }

    // 更新选课状态
    enrollment.status = status;
    if (status === 'completed') {
      enrollment.progress = 100;
    }
    await enrollment.save();

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新选课状态失败',
      error: error.message
    });
  }
};

// 更新学习进度
exports.updateProgress = async (req, res) => {
  try {
    const { chapterId } = req.body;
    const enrollmentId = req.params.id;

    // 检查选课记录是否存在
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '选课记录不存在'
      });
    }

    // 检查是否是本人的选课记录
    if (enrollment.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新此学习进度'
      });
    }

    // 更新已完成章节
    const completedChapter = enrollment.completedChapters.find(
      chapter => chapter.chapterId.toString() === chapterId
    );

    if (!completedChapter) {
      enrollment.completedChapters.push({
        chapterId,
        completedAt: new Date()
      });
    }

    enrollment.lastStudyTime = new Date();
    await enrollment.save();

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新学习进度失败',
      error: error.message
    });
  }
};

// 获取课程的学生列表
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // 验证courseId格式
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程ID格式'
      });
    }

    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限查看此课程的学生列表'
      });
    }

    // 获取课程章节总数
    const totalChapters = await Chapter.countDocuments({ courseId });

    // 获取课程作业总数
    const totalAssignments = await Assignment.countDocuments({ courseId });

    // 分页查询选课记录
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [enrollments, total] = await Promise.all([
      Enrollment.find({ courseId, status: { $ne: 'dropped' } })
        .populate('studentId', 'name avatar')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Enrollment.countDocuments({ courseId, status: { $ne: 'dropped' } })
    ]);

    // 处理返回数据
    const students = await Promise.all(enrollments.map(async enrollment => {
      // 获取作业完成数量
      const completedAssignments = await Assignment.countDocuments({
        courseId,
        'submissions.studentId': enrollment.studentId._id,
        'submissions.status': 'graded'
      });

      return {
        enrollmentId: enrollment._id,
        studentId: enrollment.studentId._id,
        studentName: enrollment.studentId.name,
        studentAvatar: enrollment.studentId.avatar,
        enrollTime: enrollment.createdAt,
        progress: enrollment.progress || 0,
        lastStudyTime: enrollment.lastStudyTime,
        completedChapters: enrollment.completedChapters.length,
        totalChapters,
        completedAssignments,
        totalAssignments
      };
    }));

    res.json({
      success: true,
      students,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取课程学生列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程学生列表失败',
      error: error.message
    });
  }
};

// 获取学生的学习详情
exports.getEnrollmentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证id格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的选课记录ID格式'
      });
    }

    // 获取选课记录详情
    const enrollment = await Enrollment.findById(id)
      .populate('studentId', 'name avatar email')
      .populate({
        path: 'courseId',
        select: 'title chapters assignments teacherId',
        populate: [
          { path: 'chapters', select: 'title order content' },
          { path: 'assignments', select: 'title deadline' }
        ]
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '选课记录不存在'
      });
    }

    // 检查权限（课程教师、管理员或学生本人可以查看）
    if (enrollment.courseId.teacherId.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        enrollment.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限查看此学习详情'
      });
    }

    console.log('Course Chapters:', enrollment.courseId.chapters);
    console.log('Course Assignments:', enrollment.courseId.assignments);

    // 获取章节学习记录
    const studyRecords = await StudyRecord.find({
      studentId: enrollment.studentId._id,
      courseId: enrollment.courseId._id,
      chapterId: { $in: enrollment.courseId.chapters }
    }).populate({
      path: 'chapterId',
      select: 'title order content'
    });

    console.log('Study Records:', studyRecords);

    // 获取作业完成情况
    const submissions = await Submission.find({
      studentId: enrollment.studentId._id,
      assignment: { $in: enrollment.courseId.assignments.map(a => a._id) }
    }).populate({
      path: 'assignment',
      select: 'title deadline'
    });

    console.log('Submissions:', submissions);

    // 构建章节数据（包括未开始学习的章节）
    const chapters = enrollment.courseId.chapters.map(chapter => {
      const record = studyRecords.find(r => r.chapterId._id.toString() === chapter._id.toString());
      return {
        chapterId: chapter._id,
        title: chapter.title,
        order: chapter.order,
        status: record ? record.status : 'not_started',
        progress: record ? record.progress : 0,
        lastStudyTime: record ? record.lastStudyTime : null
      };
    });

    // 构建作业数据（包括未提交的作业）
    const assignments = enrollment.courseId.assignments.map(assignment => {
      const submission = submissions.find(s => s.assignment._id.toString() === assignment._id.toString());
      return {
        assignmentId: assignment._id,
        title: assignment.title,
        deadline: assignment.deadline,
        submitTime: submission ? submission.submitTime : null,
        score: submission ? submission.score : null,
        status: submission ? submission.status : 'not_submitted',
        graded: submission ? submission.status === 'graded' : false
      };
    });

    // 构建返回数据
    const detailData = {
      studentName: enrollment.studentId.name,
      studentAvatar: enrollment.studentId.avatar,
      studentEmail: enrollment.studentId.email,
      enrollTime: enrollment.createdAt,
      progress: enrollment.progress,
      lastStudyTime: enrollment.lastStudyTime,
      status: enrollment.status,
      chapters,
      assignments
    };

    res.json({
      success: true,
      data: detailData
    });
  } catch (error) {
    console.error('获取学习详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学习详情失败',
      error: error.message
    });
  }
}; 