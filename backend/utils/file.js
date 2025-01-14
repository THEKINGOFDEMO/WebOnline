const fs = require('fs').promises;
const path = require('path');

// 删除文件
exports.deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('删除文件失败:', error);
    // 即使删除失败也不抛出错误，因为这通常是清理操作
  }
};

// 获取文件URL
exports.getFileUrl = (filename, type = 'uploads') => {
  return `/api/${type}/${filename}`;
};

// 验证资源文件
exports.validateResource = (file) => {
  const maxSize = 20 * 1024 * 1024; // 20MB
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '文件大小不能超过20MB'
    };
  }

  return {
    isValid: true
  };
}; 