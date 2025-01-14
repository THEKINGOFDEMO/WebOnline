const User = require('../models/user');
const UserSetting = require('../models/userSetting');
const { upload, getFileUrl, deleteFile } = require('../utils/upload');
const { validateImage } = require('../utils/fileValidation');
const path = require('path');

// 获取个人信息
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取个人信息失败',
      error: error.message
    });
  }
};

// 更新个人信息
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    // 检查邮箱是否被其他用户使用
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被使用'
        });
      }
    }

    // 如果没有变化，直接返回当前用户信息
    if (!name && !email && !avatar) {
      return res.json({
        success: true,
        user: req.user
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name: name || req.user.name,
        email: email || req.user.email,
        avatar: avatar || req.user.avatar
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    // 处理MongoDB唯一索引错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被使用'
      });
    }
    res.status(500).json({
      success: false,
      message: '更新个人信息失败',
      error: error.message
    });
  }
};

// 获取用户设置
exports.getSettings = async (req, res) => {
  try {
    let settings = await UserSetting.findOne({ userId: req.user.id });
    
    // 如果没有设置记录，创建默认设置
    if (!settings) {
      try {
        settings = await UserSetting.create({
          userId: req.user.id
        });
      } catch (error) {
        // 处理并发创建导致的唯一索引错误
        if (error.code === 11000) {
          settings = await UserSetting.findOne({ userId: req.user.id });
        } else {
          throw error;
        }
      }
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户设置失败',
      error: error.message
    });
  }
};

// 更新用户设置
exports.updateSettings = async (req, res) => {
  try {
    const { notification, theme } = req.body;

    // 如果没有变化，直接返回当前设置
    const currentSettings = await UserSetting.findOne({ userId: req.user.id });
    if (currentSettings && 
        JSON.stringify(notification) === JSON.stringify(currentSettings.notification) && 
        theme === currentSettings.theme) {
      return res.json({
        success: true,
        settings: currentSettings
      });
    }

    const settings = await UserSetting.findOneAndUpdate(
      { userId: req.user.id },
      {
        notification,
        theme
      },
      { 
        new: true, 
        runValidators: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    // 处理MongoDB唯一索引错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '用户设置记录已存在'
      });
    }
    res.status(500).json({
      success: false,
      message: '更新用户设置失败',
      error: error.message
    });
  }
};

// 获取用户列表（管理员）
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;

    const query = role ? { role } : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

// 修改用户信息（管理员）
exports.updateUser = async (req, res) => {
  try {
    const { status, role } = req.body;

    // 防止修改自己的信息
    if (req.params.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: '不能修改自己的角色和状态'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 如果没有变化，直接返回当前用户信息
    if (status === user.status && role === user.role) {
      return res.json({
        success: true,
        user
      });
    }

    user.status = status || user.status;
    user.role = role || user.role;
    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '修改用户信息失败',
      error: error.message
    });
  }
};

// 上传头像
exports.uploadAvatar = async (req, res) => {
  try {
    // 验证文件
    const validationResult = validateImage(req.file, 'avatar');
    if (!validationResult.isValid) {
      // 如果验证失败，删除已上传的文件
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: validationResult.error
      });
    }

    // 删除旧头像
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const oldAvatarPath = path.join('uploads/avatars', path.basename(user.avatar));
      await deleteFile(oldAvatarPath);
    }

    // 更新用户头像
    const avatarUrl = getFileUrl(req.file.filename, 'avatars');
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: '头像上传成功',
      user: updatedUser
    });
  } catch (error) {
    // 发生错误时删除已上传的文件
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: '头像上传失败',
      error: error.message
    });
  }
};

// 删除头像
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // 如果用户没有头像，直接返回成功
    if (!user.avatar) {
      return res.json({
        success: true,
        message: '头像已删除',
        user
      });
    }

    // 删除头像文件
    const avatarPath = path.join('uploads/avatars', path.basename(user.avatar));
    await deleteFile(avatarPath);

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { avatar: 1 } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: '头像已删除',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除头像失败',
      error: error.message
    });
  }
}; 