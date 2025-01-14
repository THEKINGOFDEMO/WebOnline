const User = require('../models/user');
const logger = require('../utils/logger');
const { AppError, ErrorCodes } = require('../utils/AppError');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const path = require('path');
const fs = require('fs/promises');
const mongoose = require('mongoose');

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // 获取用户列表
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总数
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

// 获取单个用户
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};

// 更新用户
exports.updateUser = async (req, res) => {
  try {
    const { role, status, profile } = req.body;
    const updates = {};

    // 只允许更新特定字段
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (profile) updates.profile = profile;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户失败',
      error: error.message
    });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除用户失败',
      error: error.message
    });
  }
};

// 获取系统统计数据
exports.getStatistics = async (req, res) => {
  try {
    // 用户统计
    const [
      userCount,
      studentCount,
      teacherCount,
      adminCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' })
    ]);

    // 课程统计
    const [
      courseCount,
      publishedCourseCount,
      draftCourseCount
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'draft' })
    ]);

    // 选课统计
    const [
      enrollmentCount,
      activeEnrollmentCount,
      completedEnrollmentCount
    ] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Enrollment.countDocuments({ status: 'completed' })
    ]);

    // 作业统计
    const [
      assignmentCount,
      submittedAssignmentCount,
      pendingAssignmentCount
    ] = await Promise.all([
      Assignment.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'pending' })
    ]);

    // 获取最近活动
    const recentActivity = await Promise.all([
      // 最近注册的用户
      User.find()
        .select('username role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      // 最近发布的课程
      Course.find({ status: 'published' })
        .select('title teacherId publishedAt')
        .sort({ publishedAt: -1 })
        .limit(5),
      // 最近的选课记录
      Enrollment.find()
        .select('studentId courseId createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // 系统状态（模拟数据）
    const systemStatus = {
      status: 'normal',
      cpuUsage: Math.floor(Math.random() * 30 + 20), // 20-50%
      memoryUsage: Math.floor(Math.random() * 40 + 30), // 30-70%
      diskUsage: Math.floor(Math.random() * 30 + 40) // 40-70%
    };

    const statistics = {
      userCount,
      studentCount,
      teacherCount,
      adminCount,
      courseCount,
      publishedCourseCount,
      draftCourseCount,
      enrollmentCount,
      activeEnrollmentCount,
      completedEnrollmentCount,
      assignmentCount,
      submittedAssignmentCount,
      pendingAssignmentCount,
      systemStatus,
      recentActivity: {
        users: recentActivity[0],
        courses: recentActivity[1],
        enrollments: recentActivity[2]
      }
    };

    res.json({
      success: true,
      data: { statistics }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

// 获取系统日志
exports.getLogs = async (req, res) => {
  try {
    const { type = 'access', startDate, endDate, page = 1, limit = 50 } = req.query;
    
    // 验证日志类型
    const validTypes = ['access', 'error', 'audit'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的日志类型',
        details: { validTypes }
      });
    }

    // 构建日志文件路径
    const logDir = path.join('logs', type);
    
    // 读取日志文件列表
    const logFiles = await fs.readdir(logDir);
    
    // 按日期过滤日志文件
    let filteredFiles = logFiles;
    if (startDate || endDate) {
      filteredFiles = logFiles.filter(file => {
        const fileDate = file.split('.')[0]; // 从文件名获取日期
        return (!startDate || fileDate >= startDate) && 
               (!endDate || fileDate <= endDate);
      });
    }

    // 按日期排序（降序）
    filteredFiles.sort((a, b) => b.localeCompare(a));

    // 读取日志内容
    let allLogs = [];
    for (const file of filteredFiles) {
      const content = await fs.readFile(path.join(logDir, file), 'utf-8');
      const logs = content.split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(log => log !== null);
      allLogs = allLogs.concat(logs);
    }

    // 计算分页
    const total = allLogs.length;
    const skip = (page - 1) * limit;
    const pages = Math.ceil(total / limit);
    
    // 返回分页后的日志
    const logs = allLogs
      .slice(skip, skip + limit)
      .map(log => ({
        timestamp: log.timestamp,
        type: log.type,
        message: log.message,
        details: {
          ...log,
          timestamp: undefined,
          type: undefined,
          message: undefined
        }
      }));

    res.json({
      success: true,
      data: {
        logs,
        total,
        page: parseInt(page),
        pages
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: '获取日志失败',
      error: error.message
    });
  }
};

// 系统备份
exports.backupSystem = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join('backups');
    const backupFileName = `backup_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);

    // 确保备份目录存在
    await fs.mkdir(backupDir, { recursive: true });

    // 获取所有集合的数据
    const [
      users,
      courses,
      chapters,
      assignments,
      submissions,
      enrollments,
      studyRecords
    ] = await Promise.all([
      User.find().select('-password'),
      Course.find(),
      Chapter.find(),
      Assignment.find(),
      Submission.find(),
      Enrollment.find(),
      StudyRecord.find()
    ]);

    // 构建备份数据
    const backupData = {
      timestamp,
      data: {
        users,
        courses,
        chapters,
        assignments,
        submissions,
        enrollments,
        studyRecords
      }
    };

    // 写入备份文件
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

    // 获取文件大小
    const stats = await fs.stat(backupPath);

    res.json({
      success: true,
      message: '系统备份成功',
      data: {
        filename: backupFileName,
        timestamp,
        size: stats.size
      }
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({
      success: false,
      message: '系统备份失败',
      error: error.message
    });
  }
};

// 获取备份列表
exports.getBackups = async (req, res) => {
  try {
    const backupDir = path.join('backups');
    
    // 确保备份目录存在
    await fs.mkdir(backupDir, { recursive: true });
    
    // 读取备份文件列表
    const files = await fs.readdir(backupDir);
    
    // 获取每个备份文件的信息
    const backups = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            timestamp: file.replace('backup_', '').replace('.json', '').replace(/-/g, ':'),
            size: stats.size,
            createdAt: stats.ctime
          };
        })
    );

    // 按时间降序排序
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({
      success: false,
      message: '获取备份列表失败',
      error: error.message
    });
  }
};

// 系统恢复
exports.restoreSystem = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '请指定要恢复的备份文件'
      });
    }

    const backupPath = path.join('backups', filename);
    
    // 检查文件是否存在
    try {
      await fs.access(backupPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      });
    }

    // 读取备份文件
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(backupContent);

    // 开始恢复数据（使用事务确保数据一致性）
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 清空现有数据
      await Promise.all([
        User.deleteMany({ role: { $ne: 'admin' } }, { session }), // 保留管理员账户
        Course.deleteMany({}, { session }),
        Chapter.deleteMany({}, { session }),
        Assignment.deleteMany({}, { session }),
        Submission.deleteMany({}, { session }),
        Enrollment.deleteMany({}, { session }),
        StudyRecord.deleteMany({}, { session })
      ]);

      // 恢复数据
      await Promise.all([
        User.insertMany(
          backupData.data.users.filter(user => user.role !== 'admin'),
          { session }
        ),
        Course.insertMany(backupData.data.courses, { session }),
        Chapter.insertMany(backupData.data.chapters, { session }),
        Assignment.insertMany(backupData.data.assignments, { session }),
        Submission.insertMany(backupData.data.submissions, { session }),
        Enrollment.insertMany(backupData.data.enrollments, { session }),
        StudyRecord.insertMany(backupData.data.studyRecords, { session })
      ]);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    res.json({
      success: true,
      message: '系统恢复成功',
      data: {
        timestamp: backupData.timestamp
      }
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({
      success: false,
      message: '系统恢复失败',
      error: error.message
    });
  }
};

// 删除备份
exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '请指定要删除的备份文件'
      });
    }

    const backupPath = path.join('backups', filename);
    
    // 检查文件是否存在
    try {
      await fs.access(backupPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      });
    }

    // 删除备份文件
    await fs.unlink(backupPath);

    res.json({
      success: true,
      message: '备份文件删除成功'
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      message: '删除备份文件失败',
      error: error.message
    });
  }
};

module.exports = exports; 