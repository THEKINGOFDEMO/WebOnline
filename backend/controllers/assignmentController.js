const path = require('path');
const Assignment = require('../models/assignment');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Submission = require('../models/submission');
const catchAsync = require('../utils/catchAsync');
const { upload, getFileUrl, deleteFile, validateAttachment } = require('../utils/upload');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const { AppError, ErrorCodes } = require('../utils/AppError');

// 创建作业
exports.createAssignment = catchAsync(async (req, res) => {
  const courseId = req.params.courseId;
  const { title, description, deadline, totalScore, maxAttempts } = req.body;

  // 检查课程是否存在
  const course = await Course.findById(courseId);
  if (!course) {
    // 如果上传了文件，删除它们
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    return res.status(404).json({
      success: false,
      message: '课程不存在'
    });
  }

  // 检查权限
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    // 如果上传了文件，删除它们
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    return res.status(403).json({
      success: false,
      message: '没有权限创建作业'
    });
  }

  // 处理附件
  let attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const validationResult = validateAttachment(file);
      if (!validationResult.isValid) {
        // 删除所有已上传的文件
        for (const f of req.files) {
          await deleteFile(f.path);
        }
        return res.status(400).json({
          success: false,
          message: `附件验证失败: ${validationResult.error}`
        });
      }
      attachments.push({
        title: file.originalname,
        url: getFileUrl(file.filename, 'assignments'),
        type: file.mimetype.split('/')[0],
        size: file.size,
        filename: file.filename
      });
    }
  }

  const assignment = await Assignment.create({
    courseId,
    title,
    description,
    deadline: new Date(deadline),
    totalScore,
    maxAttempts: maxAttempts || 1,
    attachments,
    status: 'draft' // 默认为草稿状态
  });

  res.status(201).json({
    success: true,
    assignment
  });
});

// 获取课程作业列表
exports.getCourseAssignments = catchAsync(async (req, res) => {
  const courseId = req.params.courseId;
  const { status } = req.query;

  // 检查课程是否存在
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: '课程不存在'
    });
  }

  // 构建查询条件
  const query = { courseId };
  
  // 根据用户角色设置查询条件
  const isTeacher = course.teacherId.toString() === req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  if (!isTeacher && !isAdmin) {
    // 学生或其他用户只能看到已发布的作业
    query.status = 'active';
    
    // 检查学生是否已选修课程
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        courseId,
        studentId: req.user.id,
        status: { $ne: 'dropped' }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: '您尚未选修该课程'
        });
      }
    }
  } else if (status) {
    // 教师和管理员可以根据状态筛选
    query.status = status;
  }

  const assignments = await Assignment.find(query)
    .sort({ deadline: 1 });

  // 处理返回数据
  const processedAssignments = await Promise.all(assignments.map(async assignment => {
    const assignmentObj = assignment.toObject();
    
    if (req.user.role === 'student') {
      // 学生只能看到自己的提交记录
      const submission = assignment.submissions.find(
        sub => sub.studentId.toString() === req.user.id
      );
      assignmentObj.submission = submission || null;
      assignmentObj.submissions = undefined; // 移除其他学生的提交记录
    } else if (!isTeacher && !isAdmin) {
      // 其他用户不能看到提交记录
      assignmentObj.submissions = undefined;
    }
    
    return assignmentObj;
  }));

  res.json({
    success: true,
    assignments: processedAssignments
  });
});

// 获取作业详情
exports.getAssignment = catchAsync(async (req, res) => {
  const assignmentId = req.params.id;

  const assignment = await Assignment.findById(assignmentId)
    .populate({
      path: 'courseId',
      select: 'title teacherId status',
      populate: {
        path: 'teacherId',
        select: 'name avatar'
      }
    });

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 判断用户权限
  const isTeacher = req.user?.id === assignment.courseId.teacherId._id.toString();
  const isAdmin = req.user?.role === 'admin';
  const isStudent = req.user?.role === 'student';

  // 如果作业未发布
  if (assignment.status !== 'active') {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '该作业暂时不可访问'
      });
    }
  }

  // 处理返回数据
  const assignmentData = assignment.toObject();

  if (isStudent) {
    // 检查学生是否已选修课程
    const enrollment = await Enrollment.findOne({
      courseId: assignment.courseId._id,
      studentId: req.user.id,
      status: { $ne: 'dropped' }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: '请先选修课程'
      });
    }

    // 学生只能看到自己的提交记录
    const submission = assignment.submissions.find(
      sub => sub.studentId.toString() === req.user.id
    );
    assignmentData.submission = submission || null;
    assignmentData.submissions = undefined;
  } else if (!isTeacher && !isAdmin) {
    // 其他用户不能看到提交记录
    assignmentData.submissions = undefined;
  }

  res.json({
    success: true,
    assignment: assignmentData
  });
});

// 提交作业
exports.submitAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user._id;
  const { content } = req.body;

  // 1. 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    // 如果上传了文件但作业不存在，删除文件
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    throw new AppError('作业不存在', 404, ErrorCodes.NOT_FOUND);
  }

  // 2. 检查作业状态
  if (assignment.status !== 'published') {
    // 如果上传了文件但作业不接受提交，删除文件
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    throw new AppError('该作业当前不接受提交', 400, ErrorCodes.INVALID_STATUS);
  }

  // 3. 检查是否已提交
  const existingSubmission = await Submission.findOne({
    assignment: id,
    studentId: studentId
  });

  let submission;
  if (existingSubmission) {
    // 如果已经提交过，更新提交内容
    let attachments = existingSubmission.attachments;
    
    // 如果上传了新文件
    if (req.file) {
      // 删除旧文件
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          try {
            await fs.unlink(attachment.path);
          } catch (err) {
            console.error('删除旧文件失败:', err);
          }
        }
      }
      
      // 添加新文件
      let fileType = 'other';
      const mimeType = req.file.mimetype.toLowerCase();
      if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document')) {
        fileType = 'document';
      }
      
      attachments = [{
        title: req.file.originalname,
        path: req.file.path,
        type: fileType,
        size: req.file.size,
        filename: req.file.filename,
        url: getFileUrl(req.file.filename, 'submissions')
      }];
    }

    // 更新提交
    submission = await Submission.findByIdAndUpdate(
      existingSubmission._id,
      {
        content: content || '无备注',
        attachments,
        submitTime: Date.now(),
        status: 'submitted'
      },
      { new: true }
    );
  } else {
    // 首次提交
    let attachments = [];
    if (req.file) {
      let fileType = 'other';
      const mimeType = req.file.mimetype.toLowerCase();
      if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document')) {
        fileType = 'document';
      }
      
      attachments = [{
        title: req.file.originalname,
        path: req.file.path,
        type: fileType,
        size: req.file.size,
        filename: req.file.filename,
        url: getFileUrl(req.file.filename, 'submissions')
      }];
    }

    submission = await Submission.create({
      assignment: id,
      studentId,
      content: content || '无备注',
      attachments,
      submitTime: Date.now(),
      status: 'submitted'
    });

    // 将提交ID添加到作业的submissions数组中
    assignment.submissions.push(submission._id);
    await assignment.save();
  }

  res.status(200).json({
    success: true,
    message: existingSubmission ? '作业重新提交成功' : '作业提交成功',
    data: submission
  });
});

// 评分作业
exports.gradeSubmission = catchAsync(async (req, res) => {
  const assignmentId = req.params.id;
  const submissionId = req.params.submissionId;
  const { score, comment } = req.body;

  // 检查作业是否存在
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '没有权限评分作业'
    });
  }

  // 查找提交记录
  const submission = await Submission.findOne({
    _id: submissionId,
    assignment: assignmentId
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: '提交记录不存在'
    });
  }

  // 更新提交记录
  submission.score = score;
  submission.comment = comment;
  submission.status = 'graded';
  submission.gradedAt = new Date();

  await submission.save();

  res.json({
    success: true,
    submission
  });
});

// 更新作业状态
exports.updateAssignmentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // 验证状态值
  if (!['draft', 'published', 'closed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: '无效的状态值',
      details: {
        status,
        validValues: ['draft', 'published', 'closed']
      }
    });
  }

  // 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权操作此作业'
    });
  }

  // 更新状态
  assignment.status = status;
  await assignment.save();

  res.status(200).json({
    success: true,
    message: '状态更新成功',
    data: assignment
  });
});

// 删除作业
exports.deleteAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权删除此作业'
    });
  }

  // 删除相关的提交记录
  await Submission.deleteMany({ assignment: id });

  // 删除作业
  await Assignment.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    message: '作业删除成功'
  });
});

// 更新作业
exports.updateAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, totalScore, maxAttempts } = req.body;

  // 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权修改此作业'
    });
  }

  // 如果作业已发布，不允许修改
  if (assignment.status === 'active') {
    return res.status(400).json({
      success: false,
      message: '已发布的作业不能修改，请先下架'
    });
  }

  // 更新作业信息
  assignment.title = title;
  assignment.description = description;
  assignment.deadline = new Date(deadline);
  assignment.totalScore = totalScore;
  assignment.maxAttempts = maxAttempts || 1;

  await assignment.save();

  res.json({
    success: true,
    message: '作业更新成功',
    assignment
  });
});

// 上传作业附件
exports.uploadAttachment = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    // 如果上传了文件，删除它们
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    // 如果上传了文件，删除它们
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    return res.status(403).json({
      success: false,
      message: '无权上传附件'
    });
  }

  // 处理附件
  let attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const validationResult = validateAttachment(file);
      if (!validationResult.isValid) {
        // 删除所有已上传的文件
        for (const f of req.files) {
          await deleteFile(f.path);
        }
        return res.status(400).json({
          success: false,
          message: `附件验证失败: ${validationResult.error}`
        });
      }
      attachments.push({
        title: file.originalname,
        url: getFileUrl(file.filename, 'assignments'),
        type: file.mimetype.split('/')[0],
        size: file.size,
        filename: file.filename
      });
    }
  }

  // 添加附件
  assignment.attachments.push(...attachments);
  await assignment.save();

  res.json({
    success: true,
    message: '附件上传成功',
    attachments
  });
});

// 删除作业附件
exports.deleteAttachment = catchAsync(async (req, res) => {
  const { id, attachmentId } = req.params;

  // 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权删除附件'
    });
  }

  // 查找附件
  const attachment = assignment.attachments.id(attachmentId);
  if (!attachment) {
    return res.status(404).json({
      success: false,
      message: '附件不存在'
    });
  }

  // 删除文件
  try {
    await deleteFile(path.join('uploads', 'assignments', attachment.filename));
  } catch (error) {
    console.error('删除文件失败:', error);
  }

  // 从数组中移除附件
  attachment.remove();
  await assignment.save();

  res.json({
    success: true,
    message: '附件删除成功'
  });
});

// 获取作业列表（支持分页和筛选）
exports.getAssignments = catchAsync(async (req, res) => {
  console.log('获取作业列表 - 请求参数:', req.query);
  console.log('当前用户:', req.user);
  
  const { page = 1, limit = 10, courseId, status, startDate, endDate } = req.query;
  
  // 构建查询条件
  const query = {};
  
  // 如果提供了courseId，验证其有效性并添加到查询条件
  if (courseId && courseId.trim() !== '') {
    console.log('处理courseId:', courseId);
    // 验证courseId是否为有效的ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log('无效的courseId格式:', courseId);
      return res.status(400).json({
        success: false,
        error: {
          code: 5002,
          message: '无效的课程ID格式',
          details: { courseId }
        }
      });
    }
    query.courseId = new mongoose.Types.ObjectId(courseId);
  }
  
  // 如果提供了status，验证其有效性并添加到查询条件
  if (status && status.trim() !== '') {
    console.log('处理status:', status);
    // 验证status是否为有效值
    if (!['published', 'draft', 'closed'].includes(status)) {
      console.log('无效的status值:', status);
      return res.status(400).json({
        success: false,
        error: {
          code: 5002,
          message: '无效的状态值',
          details: { status, validValues: ['published', 'draft', 'closed'] }
        }
      });
    }
    query.status = status;
  }
  
  // 如果提供了日期范围，验证并添加到查询条件
  if (startDate || endDate) {
    console.log('处理日期范围:', { startDate, endDate });
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 5002,
            message: '无效的开始日期格式',
            details: { startDate }
          }
        });
      }
      query.deadline = { $gte: start };
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 5002,
            message: '无效的结束日期格式',
            details: { endDate }
          }
        });
      }
      query.deadline = { ...query.deadline, $lte: end };
    }
  }

  // 验证用户是否存在
  if (!req.user) {
    console.log('用户未登录');
    return res.status(401).json({
      success: false,
      error: {
        code: 5003,
        message: '用户未登录'
      }
    });
  }
  
  // 如果是教师，只能查看自己课程的作业
  if (req.user.role === 'teacher') {
    console.log('教师角色 - 查找相关课程');
    const courses = await Course.find({ teacherId: req.user._id });
    console.log('找到的课程数量:', courses.length);
    const courseIds = courses.map(course => course._id);
    query.courseId = { $in: courseIds };
  }
  
  // 如果是学生，只能查看已选课程的作业
  if (req.user.role === 'student') {
    console.log('学生角色 - 查找已选课程');
    const enrollments = await Enrollment.find({ 
      studentId: req.user._id,
      status: 'active'
    });
    console.log('找到的选课数量:', enrollments.length);
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    query.courseId = { $in: courseIds };
    // 学生只能看到已发布的作业
    query.status = 'published';
  }

  console.log('最终查询条件:', JSON.stringify(query, null, 2));

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('courseId', 'title')
        .sort({ createdAt: -1 }),
      Assignment.countDocuments(query)
    ]);

    console.log('查询结果 - 作业数量:', assignments.length);
    console.log('查询结果 - 总数:', total);

    // 处理返回数据，添加课程标题
    const formattedAssignments = assignments.map(assignment => {
      const { courseId, ...rest } = assignment.toObject();
      return {
        ...rest,
        courseTitle: courseId ? courseId.title : '未知课程'
      };
    });

    res.json({
      success: true,
      assignments: formattedAssignments,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('查询作业列表错误:', error);
    if (error.name === 'CastError') {
      console.error('CastError详情:', {
        value: error.value,
        path: error.path,
        kind: error.kind,
        model: error.model?.modelName,
        reason: error.reason
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 5001,
        message: '查询作业列表失败',
        details: error.message
      }
    });
  }
});

// 获取作业提交记录
exports.getSubmissions = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 查找作业
  const assignment = await Assignment.findById(id)
    .populate({
      path: 'submissions.studentId',
      select: 'name avatar'
    });

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: '作业不存在'
    });
  }

  // 检查权限
  const course = await Course.findById(assignment.courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: '课程不存在'
    });
  }

  const isTeacher = course.teacherId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isTeacher && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: '无权查看提交记录'
    });
  }

  // 处理返回数据
  const submissions = assignment.submissions.map(sub => {
    const { studentId, ...rest } = sub.toObject();
    return {
      ...rest,
      studentName: studentId ? studentId.name : '未知学生',
      studentAvatar: studentId ? studentId.avatar : null
    };
  });

  // 统计信息
  const stats = {
    total: course.studentCount || 0, // 总人数
    submitted: new Set(submissions.map(s => s.studentId.toString())).size, // 已提交人数
    graded: submissions.filter(s => s.status === 'graded').length, // 已批改数量
    averageScore: 0 // 平均分
  };

  // 计算平均分
  const gradedSubmissions = submissions.filter(s => s.score !== undefined);
  if (gradedSubmissions.length > 0) {
    stats.averageScore = gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length;
  }

  res.json({
    success: true,
    submissions,
    stats
  });
});

// 获取学生的作业列表
exports.getStudentAssignments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const studentId = req.user._id;

  console.log('Getting assignments for student:', studentId);

  // 获取学生已选课程
  const enrollments = await Enrollment.find({
    studentId,
    status: 'active'
  });

  const courseIds = enrollments.map(enrollment => enrollment.courseId);

  // 构建基础查询条件
  const query = {
    courseId: { $in: courseIds },
    status: 'published'  // 只显示已发布的作业
  };

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 获取作业列表
    const assignments = await Assignment.find(query)
      .populate('courseId', 'title')
      .sort({ deadline: -1 });

    console.log('Found assignments:', assignments.length);

    // 获取提交记录，确保包含所有字段
    const submissions = await Submission.find({
      studentId,
      assignment: { $in: assignments.map(a => a._id) }
    }).select('assignment content attachments submitTime status score comment');

    console.log('Found submissions:', submissions.length);

    // 处理作业数据
    let processedAssignments = assignments.map(assignment => {
      const assignmentObj = assignment.toObject();
      const submission = submissions.find(s => 
        s.assignment.toString() === assignment._id.toString()
      );

      console.log('Processing assignment:', assignment._id);
      if (submission) {
        console.log('Found submission with attachments:', submission.attachments?.length || 0);
      }

      // 设置提交状态
      if (!submission) {
        assignmentObj.status = 'not_submitted';
      } else if (submission.status === 'graded') {
        assignmentObj.status = 'graded';
        assignmentObj.score = submission.score;
      } else {
        assignmentObj.status = 'submitted';
      }

      // 处理作业附件的 URL
      assignmentObj.attachments = assignmentObj.attachments?.map(attachment => ({
        ...attachment,
        url: getFileUrl(attachment.filename, 'assignments')
      })) || [];

      // 确保提交记录包含所有必要字段
      if (submission) {
        assignmentObj.submission = {
          _id: submission._id,
          content: submission.content,
          attachments: submission.attachments?.map(attachment => {
            if (!attachment.filename && !attachment.path) {
              console.warn('提交附件缺少 filename 和 path:', attachment);
              return attachment;
            }
            return {
              ...attachment,
              url: getFileUrl(attachment.filename || path.basename(attachment.path), 'submissions')
            };
          }) || [],
          submitTime: submission.submitTime,
          status: submission.status,
          score: submission.score,
          comment: submission.comment
        };
      }

      assignmentObj.courseTitle = assignmentObj.courseId.title;
      delete assignmentObj.courseId;

      return assignmentObj;
    });

    // 根据状态筛选
    if (status) {
      console.log('Filtering by status:', status);
      processedAssignments = processedAssignments.filter(
        assignment => assignment.status === status
      );
      console.log('After filtering:', processedAssignments.length);
    }

    // 应用分页
    const total = processedAssignments.length;
    processedAssignments = processedAssignments.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      assignments: processedAssignments,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('获取学生作业列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取作业列表失败'
    });
  }
});

// 获取作业的提交列表
exports.getAssignmentSubmissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // 1. 查找作业
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new AppError('作业不存在', 404, ErrorCodes.NOT_FOUND);
  }

  // 2. 检查权限
  const course = await Course.findById(assignment.courseId);
  if (!course) {
    throw new AppError('课程不存在', 404, ErrorCodes.NOT_FOUND);
  }

  if (course.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('没有权限查看提交列表', 403, ErrorCodes.FORBIDDEN);
  }

  // 3. 从Submission模型中获取提交记录
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [submissions, total] = await Promise.all([
    Submission.find({ assignment: id })
      .populate('studentId', 'name avatar email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ submitTime: -1 }),
    Submission.countDocuments({ assignment: id })
  ]);

  // 4. 处理提交记录
  const processedSubmissions = submissions.map(submission => {
    const submissionObj = submission.toObject();
    
    // 处理附件的 URL
    const attachments = submissionObj.attachments?.map(attachment => {
      if (!attachment.filename && !attachment.path) {
        console.warn('附件缺少 filename 和 path:', attachment);
        return attachment;
      }
      return {
        ...attachment,
        url: getFileUrl(attachment.filename || path.basename(attachment.path), 'submissions')
      };
    }) || [];
    
    return {
      _id: submissionObj._id,
      content: submissionObj.content,
      attachments,
      submitTime: submissionObj.submitTime,
      status: submissionObj.status,
      score: submissionObj.score,
      comment: submissionObj.comment,
      studentName: submissionObj.studentId?.name || '未知学生',
      studentAvatar: submissionObj.studentId?.avatar || null,
      studentEmail: submissionObj.studentId?.email || '未知邮箱'
    };
  });

  res.status(200).json({
    success: true,
    data: {
      submissions: processedSubmissions,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
}); 