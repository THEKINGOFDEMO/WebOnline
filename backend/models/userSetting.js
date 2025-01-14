const mongoose = require('mongoose');

const userSettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notification: {
    email: {
      type: Boolean,
      default: true
    },
    assignment: {
      type: Boolean,
      default: true
    },
    exam: {
      type: Boolean,
      default: true
    }
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  }
}, {
  timestamps: true
});

// 创建索引
userSettingSchema.index({ userId: 1 });

const UserSetting = mongoose.model('UserSetting', userSettingSchema);

module.exports = UserSetting; 