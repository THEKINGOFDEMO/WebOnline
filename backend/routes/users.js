const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { upload } = require('../utils/upload');
const {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  uploadAvatar,
  deleteAvatar
} = require('../controllers/userController');
const {
  updateProfileValidator,
  updateSettingsValidator
} = require('../middlewares/validators/user.validator');

// 获取个人信息
router.get('/profile', protect, getProfile);

// 更新个人信息
router.put('/profile', protect, updateProfileValidator, updateProfile);

// 获取用户设置
router.get('/settings', protect, getSettings);

// 更新用户设置
router.put('/settings', protect, updateSettingsValidator, updateSettings);

// 上传头像
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// 删除头像
router.delete('/avatar', protect, deleteAvatar);

module.exports = router; 