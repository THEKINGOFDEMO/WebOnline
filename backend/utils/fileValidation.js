const path = require('path');

// 允许的文件类型
const ALLOWED_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.gif'],
  video: ['.mp4', '.webm', '.ogg'],
  document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
  resource: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.mp4', '.zip', '.rar']
};

// 文件大小限制（字节）
const SIZE_LIMITS = {
  avatar: 2 * 1024 * 1024,      // 2MB
  coverImage: 5 * 1024 * 1024,  // 5MB
  resource: 50 * 1024 * 1024,   // 50MB
  attachment: 20 * 1024 * 1024  // 20MB
};

/**
 * 验证文件类型
 * @param {string} filename 文件名
 * @param {string[]} allowedTypes 允许的文件类型数组
 * @returns {boolean}
 */
const validateFileType = (filename, allowedTypes) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.includes(ext);
};

/**
 * 验证文件大小
 * @param {number} fileSize 文件大小（字节）
 * @param {number} sizeLimit 大小限制（字节）
 * @returns {boolean}
 */
const validateFileSize = (fileSize, sizeLimit) => {
  return fileSize <= sizeLimit;
};

/**
 * 验证图片文件
 * @param {Object} file 文件对象
 * @param {string} type 图片类型（avatar/coverImage）
 * @returns {Object} 验证结果
 */
const validateImage = (file, type) => {
  if (!file) {
    return { isValid: false, error: '未提供文件' };
  }

  // 验证文件类型
  if (!validateFileType(file.originalname, ALLOWED_TYPES.image)) {
    return { 
      isValid: false, 
      error: `不支持的文件类型。允许的类型: ${ALLOWED_TYPES.image.join(', ')}` 
    };
  }

  // 验证文件大小
  if (!validateFileSize(file.size, SIZE_LIMITS[type])) {
    return { 
      isValid: false, 
      error: `文件大小超过限制 ${SIZE_LIMITS[type] / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true };
};

/**
 * 验证课程资源文件
 * @param {Object} file 文件对象
 * @returns {Object} 验证结果
 */
const validateResource = (file) => {
  if (!file) {
    return { isValid: false, error: '未提供文件' };
  }

  // 验证文件类型
  if (!validateFileType(file.originalname, ALLOWED_TYPES.resource)) {
    return { 
      isValid: false, 
      error: `不支持的文件类型。允许的类型: ${ALLOWED_TYPES.resource.join(', ')}` 
    };
  }

  // 验证文件大小
  if (!validateFileSize(file.size, SIZE_LIMITS.resource)) {
    return { 
      isValid: false, 
      error: `文件大小超过限制 ${SIZE_LIMITS.resource / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true };
};

/**
 * 验证作业附件
 * @param {Object} file 文件对象
 * @returns {Object} 验证结果
 */
const validateAttachment = (file) => {
  if (!file) {
    return { isValid: false, error: '未提供文件' };
  }

  // 验证文件类型
  if (!validateFileType(file.originalname, ALLOWED_TYPES.document)) {
    return { 
      isValid: false, 
      error: `不支持的文件类型。允许的类型: ${ALLOWED_TYPES.document.join(', ')}` 
    };
  }

  // 验证文件大小
  if (!validateFileSize(file.size, SIZE_LIMITS.attachment)) {
    return { 
      isValid: false, 
      error: `文件大小超过限制 ${SIZE_LIMITS.attachment / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true };
};

module.exports = {
  validateImage,
  validateResource,
  validateAttachment,
  ALLOWED_TYPES,
  SIZE_LIMITS
}; 