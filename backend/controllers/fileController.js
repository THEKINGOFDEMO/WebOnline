const path = require('path');
const fs = require('fs').promises;
const { validateFileAccess } = require('../utils/fileValidation');
const { getFileUrl } = require('../utils/upload');
const Course = require('../models/course');
const Chapter = require('../models/chapter');
const Assignment = require('../models/assignment');
const User = require('../models/user');

/**
 * 获取文件信息
 */
exports.getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { type } = req.query;

    // 验证文件访问权限
    const accessResult = await validateFileAccess(fileId, type, req.user);
    if (!accessResult.isValid) {
      return res.status(403).json({ message: accessResult.message });
    }

    const fileInfo = await getFileMetadata(fileId, type);
    if (!fileInfo) {
      return res.status(404).json({ message: '文件不存在' });
    }

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ message: '获取文件信息失败', error: error.message });
  }
};

/**
 * 预览文件
 */
exports.previewFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { type } = req.query;

    // 对于公开资源(头像、课程封面)无需验证权限
    if (!['avatar', 'cover'].includes(type)) {
      const accessResult = await validateFileAccess(fileId, type, req.user);
      if (!accessResult.isValid) {
        return res.status(403).json({ message: accessResult.message });
      }
    }

    const fileUrl = getFileUrl(fileId, type);
    if (!fileUrl) {
      return res.status(404).json({ message: '文件不存在' });
    }

    const fileInfo = await getFileMetadata(fileId, type);
    res.json({ ...fileInfo, previewUrl: fileUrl });
  } catch (error) {
    res.status(500).json({ message: '预览文件失败', error: error.message });
  }
};

/**
 * 下载文件
 */
exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { type } = req.query;

    // 仅支持下载章节资源和作业附件
    if (!['resource', 'attachment'].includes(type)) {
      return res.status(400).json({ message: '不支持下载该类型文件' });
    }

    // 验证文件访问权限
    const accessResult = await validateFileAccess(fileId, type, req.user);
    if (!accessResult.isValid) {
      return res.status(403).json({ message: accessResult.message });
    }

    const filePath = path.join(process.env.UPLOAD_PATH, type, fileId);
    const fileInfo = await getFileMetadata(fileId, type);
    
    if (!fileInfo) {
      return res.status(404).json({ message: '文件不存在' });
    }

    // 记录下载日志
    await logFileDownload(fileId, type, req.user);

    res.download(filePath, fileInfo.originalname);
  } catch (error) {
    res.status(500).json({ message: '下载文件失败', error: error.message });
  }
};

/**
 * 获取文件元数据
 */
async function getFileMetadata(fileId, type) {
  try {
    let fileInfo;
    switch (type) {
      case 'avatar':
        const user = await User.findOne({ 'avatar.fileId': fileId });
        fileInfo = user?.avatar;
        break;
      case 'cover':
        const course = await Course.findOne({ 'coverImage.fileId': fileId });
        fileInfo = course?.coverImage;
        break;
      case 'resource':
        const chapter = await Chapter.findOne({ 'resources.fileId': fileId });
        fileInfo = chapter?.resources.find(r => r.fileId === fileId);
        break;
      case 'attachment':
        const assignment = await Assignment.findOne({
          $or: [
            { 'attachments.fileId': fileId },
            { 'submissions.attachments.fileId': fileId }
          ]
        });
        fileInfo = assignment?.attachments.find(a => a.fileId === fileId) ||
                  assignment?.submissions.flatMap(s => s.attachments).find(a => a.fileId === fileId);
        break;
    }
    return fileInfo;
  } catch (error) {
    console.error('获取文件元数据失败:', error);
    return null;
  }
}

/**
 * 记录文件下载日志
 */
async function logFileDownload(fileId, type, user) {
  // TODO: 实现下载日志记录
  console.log(`用户 ${user._id} 下载了文件 ${fileId} (${type})`);
} 