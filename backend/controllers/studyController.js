const StudyRecord = require('../models/studyRecord');
const Chapter = require('../models/chapter');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

// 获取章节学习状态
exports.getChapterStudyStatus = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const studentId = req.user.id;

    const record = await StudyRecord.findOne({ studentId, chapterId });

    res.json({
      success: true,
      data: record || { status: 'not_started', progress: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取学习状态失败',
      error: error.message
    });
  }
};

// 开始或继续学习章节
exports.startStudyChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const studentId = req.user.id;

    // 检查章节是否存在
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 检查是否已选课
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: chapter.courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: '请先选修课程'
      });
    }

    // 创建或更新学习记录
    let record = await StudyRecord.findOne({ studentId, chapterId });
    
    if (!record) {
      record = await StudyRecord.create({
        studentId,
        chapterId,
        courseId: chapter.courseId,
        status: 'in_progress',
        lastStudyTime: new Date()
      });
    } else {
      record.status = 'in_progress';
      record.lastStudyTime = new Date();
      await record.save();
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '开始学习失败',
      error: error.message
    });
  }
};

// 更新学习进度
exports.updateStudyProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { progress } = req.body;
    const studentId = req.user.id;

    // 验证进度值
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: '进度值必须在0-100之间'
      });
    }

    // 更新学习记录
    let record = await StudyRecord.findOne({ studentId, chapterId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '学习记录不存在'
      });
    }

    record.progress = progress;
    record.lastStudyTime = new Date();
    
    // 如果进度达到100%，标记为已完成
    if (progress === 100) {
      record.status = 'completed';
      record.completedAt = new Date();
    }

    await record.save();

    // 更新课程总进度
    if (record.status === 'completed') {
      const chapter = await Chapter.findById(chapterId);
      const enrollment = await Enrollment.findOne({
        studentId,
        courseId: chapter.courseId
      });

      if (enrollment) {
        const allChapters = await Chapter.find({ courseId: chapter.courseId });
        const completedRecords = await StudyRecord.find({
          studentId,
          courseId: chapter.courseId,
          status: 'completed'
        });

        enrollment.progress = Math.round((completedRecords.length / allChapters.length) * 100);
        enrollment.completedChapters = completedRecords.map(record => record.chapterId);
        await enrollment.save();
      }
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新进度失败',
      error: error.message
    });
  }
};

// 完成章节学习
exports.completeChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const studentId = req.user.id;

    // 检查章节是否存在
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 检查是否已选课
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: chapter.courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: '请先选修课程'
      });
    }

    // 更新学习记录
    let record = await StudyRecord.findOne({ studentId, chapterId });
    
    if (!record) {
      record = await StudyRecord.create({
        studentId,
        chapterId,
        courseId: chapter.courseId,
        status: 'completed',
        progress: 100,
        lastStudyTime: new Date(),
        completedAt: new Date()
      });
    } else {
      record.status = 'completed';
      record.progress = 100;
      record.lastStudyTime = new Date();
      record.completedAt = new Date();
      await record.save();
    }

    // 更新课程总进度
    const allChapters = await Chapter.find({ courseId: chapter.courseId });
    const completedRecords = await StudyRecord.find({
      studentId,
      courseId: chapter.courseId,
      status: 'completed'
    });

    // 检查章节是否已经在完成列表中
    const chapterAlreadyCompleted = enrollment.completedChapters.some(
      ch => ch.chapterId.toString() === chapterId
    );

    if (!chapterAlreadyCompleted) {
      enrollment.completedChapters.push({
        chapterId: chapterId,
        completedAt: new Date()
      });
    }

    enrollment.progress = Math.round((completedRecords.length / allChapters.length) * 100);
    await enrollment.save();

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '完成章节学习失败',
      error: error.message
    });
  }
};

// 获取课程学习统计
exports.getCourseStudyStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const records = await StudyRecord.find({
      studentId,
      courseId
    }).populate('chapterId', 'title order');

    const stats = {
      totalChapters: records.length,
      completedChapters: records.filter(r => r.status === 'completed').length,
      inProgressChapters: records.filter(r => r.status === 'in_progress').length,
      notStartedChapters: records.filter(r => r.status === 'not_started').length,
      lastStudyTime: records.reduce((latest, record) => {
        return latest > record.lastStudyTime ? latest : record.lastStudyTime;
      }, new Date(0)),
      chapterProgress: records.map(record => ({
        chapterId: record.chapterId._id,
        title: record.chapterId.title,
        order: record.chapterId.order,
        status: record.status,
        progress: record.progress,
        lastStudyTime: record.lastStudyTime
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取学习统计失败',
      error: error.message
    });
  }
}; 