const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // 其他MongoDB选项
      serverSelectionTimeoutMS: 5000, // 超时时间
      socketTimeoutMS: 45000, // Socket超时
      family: 4 // 强制使用IPv4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 监听数据库连接事件
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // 如果连接失败，退出进程
  }
};

module.exports = connectDB;
