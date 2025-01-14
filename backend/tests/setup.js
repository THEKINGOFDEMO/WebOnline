const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// 连接到测试数据库
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// 每个测试后清理集合
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// 断开连接并停止MongoDB服务器
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// 设置测试超时时间
jest.setTimeout(30000); 