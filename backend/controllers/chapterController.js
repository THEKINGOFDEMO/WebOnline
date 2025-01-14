const Chapter = require('../models/chapter');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const path = require('path');
const { deleteFile, getFileUrl, validateResource } = require('../utils/file');

// 创建章节
exports.createChapter = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { title, description, content, duration } = req.body;

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
        message: '没有权限创建章节'
      });
    }

    // 获取最大的order值
    const maxOrderChapter = await Chapter.findOne({ courseId }).sort('-order');
    const order = maxOrderChapter ? maxOrderChapter.order + 1 : 1;

    const chapter = await Chapter.create({
      courseId,
      title,
      description,
      content,
      duration,
      order
    });

    res.status(201).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建章节失败',
      error: error.message
    });
  }
};

// 获取课程的所有章节
exports.getChapters = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 如果课程未发布，检查访问权限
    if (course.status !== 'published' && 
        req.user.role !== 'admin' && 
        course.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '该课程尚未发布'
      });
    }

    const chapters = await Chapter.find({ courseId })
      .sort({ order: 1 });

    res.json({
      success: true,
      chapters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取章节列表失败',
      error: error.message
    });
  }
};

// 更新章节
exports.updateChapter = async (req, res) => {
  try {
    const { title, content, order, description } = req.body;
    const chapterId = req.params.id;

    // 获取章节信息
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 检查权限
    const course = await Course.findById(chapter.courseId);
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限修改此章节'
      });
    }

    // 如果要更改顺序，检查新顺序是否已存在
    if (order && order !== chapter.order) {
      const existingChapter = await Chapter.findOne({
        courseId: chapter.courseId,
        order,
        _id: { $ne: chapterId }
      });

      if (existingChapter) {
        return res.status(400).json({
          success: false,
          message: '该章节顺序已存在'
        });
      }
    }

    chapter.title = title || chapter.title;
    chapter.content = content || chapter.content;
    chapter.order = order || chapter.order;
    chapter.description = description || chapter.description;

    await chapter.save();

    res.json({
      success: true,
      chapter
    });
  } catch (error) {
    // 处理唯一索引冲突
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '该章节顺序已存在'
      });
    }
    res.status(500).json({
      success: false,
      message: '更新章节失败',
      error: error.message
    });
  }
};

// 上传章节资源
exports.uploadResource = async (req, res) => {
  try {
    const chapterId = req.params.id;

    // 检查章节是否存在
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 检查权限
    const course = await Course.findById(chapter.courseId);
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: '没有权限上传资源'
      });
    }

    // 验证文件
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传资源文件'
      });
    }

    const validationResult = validateResource(req.file);
    if (!validationResult.isValid) {
      await deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: validationResult.error
      });
    }

    // 获取文件信息
    const { title } = req.body;
    const fileUrl = getFileUrl(req.file.filename, 'resources');
    const mimeType = req.file.mimetype.split('/')[0]; // 获取文件类型(video/image/application等)
    
    // 转换MIME类型到资源类型
    let fileType;
    switch (mimeType) {
      case 'video':
        fileType = 'video';
        break;
      case 'image':
        fileType = 'image';
        break;
      case 'application':
        fileType = 'document';
        break;
      default:
        fileType = 'other';
    }

    // 添加资源
    chapter.resources.push({
      title: title || req.file.originalname,
      url: fileUrl,
      type: fileType,
      size: Math.round(req.file.size / 1024), // 转换为KB
      filename: req.file.filename // 保存文件名以便后续删除
    });

    await chapter.save();

    res.json({
      success: true,
      chapter
    });
  } catch (error) {
    // 发生错误时删除已上传的文件
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: '上传资源失败',
      error: error.message
    });
  }
};

// 删除章节资源
exports.deleteResource = async (req, res) => {
  try {
    const { id: chapterId, resourceId } = req.params;

    // 检查章节是否存在
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 检查权限
    const course = await Course.findById(chapter.courseId);
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限删除资源'
      });
    }

    // 查找资源
    const resource = chapter.resources.id(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '资源不存在'
      });
    }

    // 删除文件
    if (resource.filename) {
      const filePath = path.join('uploads/resources', resource.filename);
      await deleteFile(filePath);
    }

    // 从数组中移除资源
    resource.remove();
    await chapter.save();

    res.json({
      success: true,
      message: '资源删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除资源失败',
      error: error.message
    });
  }
};

// 获取章节详情
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate({
        path: 'courseId',
        select: 'title status teacherId',
        populate: {
          path: 'teacherId',
          select: 'name avatar'
        }
      });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 判断用户权限和章节状态
    const isTeacher = req.user?.id === chapter.courseId.teacherId._id.toString();
    const isAdmin = req.user?.role === 'admin';
    const isStudent = req.user?.role === 'student';

    // 如果课程或章节未发布
    if (chapter.courseId.status !== 'published') {
      // 未登录用户不能查看
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: '该内容暂时不可访问'
        });
      }

      // 非课程教师且非管理员不能查看
      if (!isTeacher && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: '该内容暂时不可访问'
        });
      }
    }

    // 处理返回数据
    const chapterData = chapter.toObject();

    // 如果是学生，需要检查是否已选课
    if (isStudent) {
      const enrollment = await Enrollment.findOne({
        studentId: req.user.id,
        courseId: chapter.courseId._id,
        status: { $ne: 'dropped' }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: '请先选修课程'
        });
      }

      // 添加学习进度信息
      chapterData.completed = enrollment.completedChapters.includes(chapter._id);
      chapterData.lastAccessTime = enrollment.chapterProgress?.[chapter._id]?.lastAccessTime;
    }

    // 非教师和管理员不能查看未发布的资源
    if (!isTeacher && !isAdmin) {
      chapterData.resources = chapterData.resources.filter(resource => 
        resource.status === 'published'
      );
    }

    res.json({
      success: true,
      chapter: chapterData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取章节详情失败',
      error: error.message
    });
  }
};

// 删除章节
exports.deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;

    // 获取章节信息
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 检查权限
    const course = await Course.findById(chapter.courseId);
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此章节'
      });
    }

    // 删除章节及其资源
    await Chapter.findByIdAndDelete(chapterId);

    res.json({
      success: true,
      message: '章节删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除章节失败',
      error: error.message
    });
  }
}; 