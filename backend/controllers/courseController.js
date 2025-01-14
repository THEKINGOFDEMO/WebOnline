const Course = require('../models/course');
const Chapter = require('../models/chapter');
const Enrollment = require('../models/enrollment');
const { validateImage } = require('../utils/fileValidation');
const { upload, getFileUrl, deleteFile } = require('../utils/upload');
const path = require('path');

// 创建课程
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    // 检查教师是否已有同名课程
    const existingCourse = await Course.findOne({
      teacherId: req.user.id,
      title: title
    });

    if (existingCourse) {
      // 如果上传了文件，删除它
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: '您已创建过同名课程'
      });
    }

    // 处理封面图片
    let coverImage = null;
    if (req.file) {
      const validationResult = validateImage(req.file, 'coverImage');
      if (!validationResult.isValid) {
        await deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: validationResult.error
        });
      }
      coverImage = getFileUrl(req.file.filename, 'covers');
    }

    const course = await Course.create({
      title,
      description,
      coverImage,
      category,
      level,
      price,
      teacherId: req.user.id,
      status: 'draft' // 默认为草稿状态
    });

    res.status(201).json({
      success: true,
      course
    });
  } catch (error) {
    // 如果创建失败且上传了文件，删除它
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: '创建课程失败',
      error: error.message
    });
  }
};

// 获取课程列表
exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, level, search } = req.query;

    // 构建基础查询条件
    const query = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 根据用户角色设置查询条件
    switch (req.user.role) {
      case 'student':
        // 学生只能看到已发布的课程
        query.status = 'published';
        break;
      case 'teacher':
        // 教师可以看到自己的所有课程和其他已发布的课程
        query.$or = [
          { teacherId: req.user.id },
          { status: 'published' }
        ];
        break;
      case 'admin':
        // 管理员可以看到所有课程
        break;
      default:
        // 未登录用户只能看到已发布的课程
        query.status = 'published';
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('teacherId', 'name avatar')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // 获取每个课程的实际学生数量
    const processedCourses = await Promise.all(courses.map(async course => {
      const courseObj = course.toObject();
      // 统计该课程的有效报名人数(状态为 active 的报名记录)
      const studentCount = await Enrollment.countDocuments({ 
        courseId: course._id,
        status: 'active'
      });
      courseObj.studentCount = studentCount;
      
      // 如果不是课程创建者或管理员，隐藏某些字段
      if (course.teacherId._id.toString() !== req.user?.id && req.user?.role !== 'admin') {
        delete courseObj.revenue;
      }
      return courseObj;
    }));

    res.json({
      success: true,
      courses: processedCourses,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取课程列表失败',
      error: error.message
    });
  }
};

// 获取课程详情
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacherId', 'name avatar')
      .populate('chapters', 'title order content duration');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 判断用户权限和课程状态
    const isTeacher = req.user?.id === course.teacherId._id.toString();
    const isAdmin = req.user?.role === 'admin';
    
    // 如果课程未发布，且不是课程教师或管理员，且不是从编辑页面访问
    if (course.status !== 'published' && !isTeacher && !isAdmin && !req.query.edit) {
      return res.status(403).json({
        success: false,
        message: '该课程尚未发布'
      });
    }

    // 处理返回数据
    const courseData = course.toObject();

    // 如果不是课程教师或管理员，隐藏敏感信息
    if (!isTeacher && !isAdmin) {
      delete courseData.studentCount;
      delete courseData.revenue;
    }

    res.json({
      success: true,
      course: courseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取课程详情失败',
      error: error.message
    });
  }
};

// 更新课程信息
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, status, category, level, price } = req.body;
    const courseId = req.params.id;

    // 获取课程信息
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
        message: '没有权限修改此课程'
      });
    }

    // 检查课程状态
    if (course.status === 'published') {
      return res.status(403).json({
        success: false,
        message: '已发布的课程不能直接编辑，请先下架课程'
      });
    }

    // 如果要更改标题，检查是否与其他课程重名
    if (title && title !== course.title) {
      const existingCourse = await Course.findOne({
        teacherId: req.user.id,
        title: title,
        _id: { $ne: courseId }
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: '您已创建过同名课程'
        });
      }
    }

    // 如果没有实际变化，直接返回
    if (!hasChanges(course, { title, description, status, category, level, price })) {
      return res.json({
        success: true,
        course
      });
    }

    // 更新课程信息
    course.title = title || course.title;
    course.description = description || course.description;
    course.status = status || course.status;
    course.category = category || course.category;
    course.level = level || course.level;
    course.price = price || course.price;

    await course.save();

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新课程信息失败',
      error: error.message
    });
  }
};

// 删除课程
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
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
        message: '没有权限删除此课程'
      });
    }

    // 检查是否有学生已选修此课程
    const enrollmentCount = await Enrollment.countDocuments({ courseId: req.params.id });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: '已有学生选修此课程，无法删除'
      });
    }

    // 删除课程相关的所有章节
    await Chapter.deleteMany({ courseId: req.params.id });
    
    // 删除课程
    await course.remove();

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除课程失败',
      error: error.message
    });
  }
};

// 更新课程状态
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const courseId = req.params.id;

    // 获取课程信息
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
        message: '没有权限修改此课程状态'
      });
    }

    // 验证状态变更的合法性
    if (status === 'published') {
      // 检查课程是否满足发布条件
      const chaptersCount = await Chapter.countDocuments({ courseId });
      if (chaptersCount === 0) {
        return res.status(400).json({
          success: false,
          message: '课程至少需要一个章节才能发布'
        });
      }

      // 检查必要字段是否完整
      if (!course.title || !course.description || !course.coverImage) {
        return res.status(400).json({
          success: false,
          message: '课程信息不完整，无法发布'
        });
      }
    }

    // 更新状态
    course.status = status;
    course.publishedAt = status === 'published' ? new Date() : null;
    await course.save();

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新课程状态失败',
      error: error.message
    });
  }
};

// 更新课程封面
exports.updateCoverImage = async (req, res) => {
  try {
    // 验证文件
    const validationResult = validateImage(req.file, 'coverImage');
    if (!validationResult.isValid) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: validationResult.error
      });
    }

    const course = await Course.findById(req.params.id);
    
    // 检查课程是否存在
    if (!course) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: '没有权限修改此课程'
      });
    }

    // 删除旧封面
    if (course.coverImage) {
      const oldCoverPath = path.join('uploads/covers', path.basename(course.coverImage));
      await deleteFile(oldCoverPath);
    }

    // 更新课程封面
    const coverImage = getFileUrl(req.file.filename, 'covers');
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { coverImage },
      { new: true }
    ).populate('teacherId', 'name avatar');

    res.json({
      success: true,
      message: '课程封面更新成功',
      course: updatedCourse
    });
  } catch (error) {
    // 发生错误时删除已上传的文件
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: '更新课程封面失败',
      error: error.message
    });
  }
};

// 辅助函数：检查对象是否有变化
function hasChanges(original, updates) {
  return Object.keys(updates).some(key => {
    return updates[key] && updates[key] !== original[key];
  });
} 