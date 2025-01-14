const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getFileInfo, previewFile, downloadFile } = require('../controllers/fileController');

// 获取文件信息
router.get('/info/:fileId', protect, getFileInfo);

// 预览文件
router.get('/preview/:fileId', previewFile);

// 下载文件
router.get('/download/:fileId', protect, downloadFile);

module.exports = router; 