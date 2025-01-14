const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 创建测试用户
exports.createTestUser = async (role = 'student') => {
  const user = await User.create({
    username: `test_${role}_${Date.now()}`,
    password: 'password123',
    email: `test_${role}_${Date.now()}@test.com`,
    name: `Test ${role}`,
    role: role,
    status: 'active'
  });
  return user;
};

// 生成测试用 JWT token
exports.generateTestToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

// 创建测试课程
exports.createTestCourse = async (teacher) => {
  const Course = require('../models/course');
  return await Course.create({
    title: `Test Course ${Date.now()}`,
    description: 'Test course description',
    teacherId: teacher._id,
    category: 'test',
    level: 'beginner',
    status: 'published'
  });
};

// 创建测试章节
exports.createTestChapter = async (course) => {
  const Chapter = require('../models/chapter');
  return await Chapter.create({
    courseId: course._id,
    title: `Test Chapter ${Date.now()}`,
    content: 'Test chapter content',
    order: 1
  });
};

// 创建测试作业
exports.createTestAssignment = async (course) => {
  const Assignment = require('../models/assignment');
  return await Assignment.create({
    courseId: course._id,
    title: `Test Assignment ${Date.now()}`,
    description: 'Test assignment description',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalScore: 100,
    status: 'active'
  });
}; 