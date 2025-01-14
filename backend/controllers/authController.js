const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserSetting = require('../models/userSetting');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被使用'
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
      role,
      name,
      email
    });

    // 创建用户设置
    await UserSetting.create({
      userId: user._id
    });

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 返回用户信息（不包含密码）
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查用户是否存在
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 检查账号状态
    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 返回用户信息（不包含密码）
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
};

// 用户登出
exports.logout = async (req, res) => {
  try {
    // JWT 是无状态的，客户端只需要删除本地存储的 token
    // 这里可以添加一些额外的清理工作

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登出失败',
      error: error.message
    });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 检查用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '未找到该邮箱对应的用户'
      });
    }

    // TODO: 实现发送重置密码邮件的逻辑
    // 1. 生成重置密码的临时token
    // 2. 发送重置密码邮件
    // 3. 保存重置密码的token和过期时间

    res.json({
      success: true,
      message: '重置密码邮件已发送，请检查您的邮箱'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '重置密码失败',
      error: error.message
    });
  }
};

// 更新密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新密码失败',
      error: error.message
    });
  }
}; 