const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const createUploadDir = (dir) => {
  const uploadDir = path.join(__dirname, '..', 'uploads', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据上传类型选择不同的目录
    let uploadDir = 'others';
    if (req.originalUrl.includes('/assignments/') && !req.originalUrl.includes('/submit')) {
      uploadDir = 'assignments';
    } else if (req.originalUrl.includes('/submit')) {
      uploadDir = 'submissions';
    } else if (req.originalUrl.includes('/avatars')) {
      uploadDir = 'avatars';
    }
    
    console.log('Upload directory:', uploadDir, 'for URL:', req.originalUrl);
    const dir = createUploadDir(uploadDir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // 生成文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件验证函数
const validateAttachment = (file) => {
  // 允许的文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed'
  ];

  // 最大文件大小 (50MB)
  const maxSize = 50 * 1024 * 1024;

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: '只支持 PDF、Word 和 ZIP 格式的文件'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '文件大小不能超过 50MB'
    };
  }

  return {
    isValid: true
  };
};

// 获取文件URL
const getFileUrl = (filename, type = 'others') => {
  return `/api/uploads/${type}/${filename}`;
};

// 删除文件
const deleteFile = async (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error) {
    console.error('删除文件失败:', error);
  }
};

// 配置上传中间件
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制文件大小为 50MB
  }
});

module.exports = {
  upload,
  getFileUrl,
  deleteFile,
  validateAttachment
}; 