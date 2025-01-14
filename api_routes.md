# API 接口文档

## 1. 通用说明

### 1.1 基础信息
- 基础路径：`/api`
- 请求方式：REST API
- 数据格式：JSON
- 字符编码：UTF-8

### 1.2 认证方式
- 使用 Bearer Token 认证
- 在请求头中添加：`Authorization: Bearer <token>`
- Token 通过登录接口获取

### 1.3 错误处理
所有接口的错误响应格式统一为：
```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

#### 错误码说明
1. 认证相关错误 (AUTH_*)
   - `AUTH_REQUIRED`: 需要登录
   - `AUTH_INVALID_TOKEN`: 无效的token
   - `AUTH_TOKEN_EXPIRED`: token已过期
   - `AUTH_NO_PERMISSION`: 没有权限

2. 用户相关错误 (USER_*)
   - `USER_NOT_FOUND`: 用户不存在
   - `USER_ALREADY_EXISTS`: 用户已存在
   - `USER_INVALID_PASSWORD`: 密码错误

3. 课程相关错误 (COURSE_*)
   - `COURSE_NOT_FOUND`: 课程不存在
   - `COURSE_NO_ACCESS`: 无权访问该课程
   - `COURSE_ALREADY_ENROLLED`: 已经选修该课程

4. 文件相关错误 (FILE_*)
   - `FILE_TOO_LARGE`: 文件太大
   - `FILE_TYPE_NOT_ALLOWED`: 文件类型不允许
   - `FILE_UPLOAD_ERROR`: 文件上传失败

5. 数据验证错误 (VALIDATION_*)
   - `VALIDATION_ERROR`: 数据验证失败
   - `INVALID_INPUT`: 无效的输入

6. 系统错误 (SYSTEM_*)
   - `INTERNAL_ERROR`: 服务器内部错误
   - `SERVICE_UNAVAILABLE`: 服务不可用

### 1.4 日志记录
系统会自动记录以下类型的日志：

1. 访问日志
   - 所有API请求的访问记录
   - 包含请求方法、URL、响应时间等信息
   - 不记录敏感信息（如密码）

2. 错误日志
   - 所有系统错误和异常
   - 包含错误堆栈和上下文信息
   - 用于问题诊断和修复

3. 审计日志
记录关键操作，包括：
   - 用户认证：注册、登录、登出、密码修改
   - 课程管理：创建、修改、删除、状态变更
   - 选课操作：选课、退课、进度更新
   - 管理操作：用户管理、系统维护

### 1.5 响应格式
成功响应：
```javascript
{
  "success": true,
  "data": {
    // 具体的响应数据
  }
}
```

分页响应：
```javascript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## 2. 认证接口

### 2.1 用户认证
```javascript
/**
 * @api {post} /api/auth/register 用户注册
 * @apiHeader {String} Content-Type application/json
 * @apiBody {String} username 用户名
 * @apiBody {String} password 密码(必须包含大小写字母和数字)
 * @apiBody {String} email 邮箱
 * @apiBody {String} name 姓名
 * @apiBody {String} role 角色(student/teacher)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.user 用户信息
 * @apiSuccess {String} data.token 访问令牌
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "errors": [
 *     {
 *       "field": "password",
 *       "message": "密码必须包含大小写字母和数字"
 *     }
 *   ]
 * }
 */
POST /api/auth/register

/**
 * @api {post} /api/auth/login 用户登录
 * @apiBody {String} username 用户名
 * @apiBody {String} password 密码
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.user 用户信息
 * @apiSuccess {String} data.token 访问令牌
 */
POST /api/auth/login

/**
 * @api {post} /api/auth/logout 用户登出
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiSuccess {Boolean} success 是否成功
 */
POST /api/auth/logout

/**
 * @api {post} /api/auth/reset-password 重置密码
 * @apiBody {String} email 邮箱
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {String} message 提示信息
 */
POST /api/auth/reset-password

/**
 * @api {post} /api/auth/update-password 更新密码
 * @apiHeader {String} Authorization Bearer Token
 * @apiBody {String} currentPassword 当前密码
 * @apiBody {String} newPassword 新密码(必须包含大小写字母和数字)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {String} message 提示信息
 */
POST /api/auth/update-password
```

## 3. 用户接口

### 3.1 个人信息管理
```javascript
/**
 * @api {get} /api/users/profile 获取个人信息
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.profile 个人信息
 */
GET /api/users/profile

/**
 * @api {put} /api/users/profile 更新个人信息
 * @apiHeader {String} Authorization Bearer Token
 * @apiBody {String} [name] 姓名
 * @apiBody {String} [email] 邮箱
 * @apiBody {Object} [profile] 其他资料
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.profile 更新后的个人信息
 */
PUT /api/users/profile

/**
 * @api {get} /api/users/settings 获取用户设置
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.settings 用户设置
 */
GET /api/users/settings

/**
 * @api {put} /api/users/settings 更新用户设置
 * @apiHeader {String} Authorization Bearer Token
 * @apiBody {Object} settings 设置项
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.settings 更新后的设置
 */
PUT /api/users/settings

/**
 * @api {post} /api/users/avatar 上传头像
 * @apiHeader {String} Authorization Bearer Token
 * @apiBody {File} avatar 头像文件
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {String} data.avatarUrl 头像URL
 */
POST /api/users/avatar

/**
 * @api {delete} /api/users/avatar 删除头像
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiSuccess {Boolean} success 是否成功
 */
DELETE /api/users/avatar
```

## 4. 课程接口

### 4.1 课程管理
```javascript
/**
 * @api {post} /api/courses 创建课程
 * @apiHeader {String} Authorization Bearer Token
 * @apiBody {String} title 课程标题
 * @apiBody {String} description 课程描述
 * @apiBody {File} coverImage 封面图片
 * @apiBody {String} category 课程分类
 * @apiBody {String} level 难度级别
 * @apiBody {Number} price 课程价格
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.course 创建的课程
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有创建课程的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - VALIDATION_ERROR: 输入数据验证失败
 * - FILE_TOO_LARGE: 文件太大
 * - FILE_TYPE_NOT_ALLOWED: 文件类型不允许
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/courses

/**
 * @api {get} /api/courses 获取课程列表
 * @apiQuery {Number} page 页码
 * @apiQuery {Number} limit 每页数量
 * @apiQuery {String} [category] 课程分类
 * @apiQuery {String} [level] 难度级别
 * @apiQuery {String} [search] 搜索关键词
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Array} data.courses 课程列表
 * @apiSuccess {Number} data.total 总数
 * @apiSuccess {Number} data.page 当前页码
 * @apiSuccess {Number} data.pages 总页数
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "无效的查询参数"
 *   }
 * }
 * 
 * 可能的错误码：
 * - VALIDATION_ERROR: 输入数据验证失败
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/courses

/**
 * @api {get} /api/courses/:id 获取课程详情
 * @apiParam {String} id 课程ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.course 课程详情
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "COURSE_NOT_FOUND",
 *     "message": "课程不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - COURSE_NOT_FOUND: 课程不存在
 * - COURSE_NO_ACCESS: 无权访问该课程
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/courses/:id

/**
 * @api {put} /api/courses/:id 更新课程信息
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 课程ID
 * @apiBody {String} [title] 课程标题
 * @apiBody {String} [description] 课程描述
 * @apiBody {String} [category] 课程分类
 * @apiBody {String} [level] 难度级别
 * @apiBody {Number} [price] 课程价格
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.course 更新后的课程
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有修改此课程的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - COURSE_NOT_FOUND: 课程不存在
 * - VALIDATION_ERROR: 输入数据验证失败
 * - INTERNAL_ERROR: 服务器内部错误
 */
PUT /api/courses/:id

/**
 * @api {patch} /api/courses/:id/status 更新课程状态
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 课程ID
 * @apiBody {String} status 课程状态(draft/published/closed)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.course 更新后的课程
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "无效的课程状态"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - COURSE_NOT_FOUND: 课程不存在
 * - VALIDATION_ERROR: 输入数据验证失败
 * - INTERNAL_ERROR: 服务器内部错误
 */
PATCH /api/courses/:id/status

/**
 * @api {patch} /api/courses/:id/cover 更新课程封面
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 课程ID
 * @apiBody {File} coverImage 课程封面图片(最大5MB)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.course 更新后的课程
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FILE_TOO_LARGE",
 *     "message": "文件大小超过限制"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - COURSE_NOT_FOUND: 课程不存在
 * - FILE_TOO_LARGE: 文件太大
 * - FILE_TYPE_NOT_ALLOWED: 文件类型不允许
 * - INTERNAL_ERROR: 服务器内部错误
 */
PATCH /api/courses/:id/cover

/**
 * @api {delete} /api/courses/:id 删除课程
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 课程ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有删除此课程的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - COURSE_NOT_FOUND: 课程不存在
 * - INTERNAL_ERROR: 服务器内部错误
 */
DELETE /api/courses/:id
```

### 4.2 章节管理
```javascript
/**
 * @api {get} /api/courses/:courseId/chapters 获取课程章节列表
 * @apiParam {String} courseId 课程ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Array} data.chapters 章节列表
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "COURSE_NOT_FOUND",
 *     "message": "课程不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - COURSE_NOT_FOUND: 课程不存在
 * - COURSE_NO_ACCESS: 无权访问该课程
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/courses/:courseId/chapters

/**
 * @api {post} /api/courses/:courseId/chapters 创建章节
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} courseId 课程ID
 * @apiBody {String} title 章节标题
 * @apiBody {String} description 章节描述
 * @apiBody {String} content 章节内容
 * @apiBody {Number} order 章节顺序
 * @apiBody {Number} duration 章节时长(分钟)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.chapter 创建的章节
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有创建章节的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - COURSE_NOT_FOUND: 课程不存在
 * - VALIDATION_ERROR: 输入数据验证失败
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/courses/:courseId/chapters

/**
 * @api {get} /api/chapters/:id 获取章节详情
 * @apiParam {String} id 章节ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.chapter 章节详情
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "CHAPTER_NOT_FOUND",
 *     "message": "章节不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - CHAPTER_NOT_FOUND: 章节不存在
 * - COURSE_NO_ACCESS: 无权访问该课程
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/chapters/:id

/**
 * @api {put} /api/chapters/:id 更新章节
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 章节ID
 * @apiBody {String} [title] 章节标题
 * @apiBody {String} [description] 章节描述
 * @apiBody {String} [content] 章节内容
 * @apiBody {Number} [order] 章节顺序
 * @apiBody {Number} [duration] 章节时长(分钟)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.chapter 更新后的章节
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有修改此章节的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - CHAPTER_NOT_FOUND: 章节不存在
 * - VALIDATION_ERROR: 输入数据验证失败
 * - INTERNAL_ERROR: 服务器内部错误
 */
PUT /api/chapters/:id

/**
 * @api {delete} /api/chapters/:id 删除章节
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 章节ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有删除此章节的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - CHAPTER_NOT_FOUND: 章节不存在
 * - INTERNAL_ERROR: 服务器内部错误
 */
DELETE /api/chapters/:id

/**
 * @api {post} /api/chapters/:id/resources 上传章节资源
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 章节ID
 * @apiBody {File} resource 资源文件(最大50MB)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.resource 上传的资源
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FILE_TOO_LARGE",
 *     "message": "文件大小超过限制"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - CHAPTER_NOT_FOUND: 章节不存在
 * - FILE_TOO_LARGE: 文件太大
 * - FILE_TYPE_NOT_ALLOWED: 文件类型不允许
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/chapters/:id/resources

/**
 * @api {delete} /api/chapters/:id/resources/:resourceId 删除章节资源
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 章节ID
 * @apiParam {String} resourceId 资源ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "RESOURCE_NOT_FOUND",
 *     "message": "资源不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - CHAPTER_NOT_FOUND: 章节不存在
 * - RESOURCE_NOT_FOUND: 资源不存在
 * - INTERNAL_ERROR: 服务器内部错误
 */
DELETE /api/chapters/:id/resources/:resourceId
```

### 4.3 作业管理
```javascript
/**
 * @api {get} /api/courses/:courseId/assignments 获取课程作业列表
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} courseId 课程ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Array} data.assignments 作业列表
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "COURSE_NOT_FOUND",
 *     "message": "课程不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - COURSE_NOT_FOUND: 课程不存在
 * - COURSE_NO_ACCESS: 无权访问该课程
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/courses/:courseId/assignments

/**
 * @api {get} /api/assignments/:id 获取作业详情
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 作业ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.assignment 作业详情
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ASSIGNMENT_NOT_FOUND",
 *     "message": "作业不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - ASSIGNMENT_NOT_FOUND: 作业不存在
 * - COURSE_NO_ACCESS: 无权访问该课程
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/assignments/:id

/**
 * @api {post} /api/courses/:courseId/assignments 创建作业
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} courseId 课程ID
 * @apiBody {String} title 作业标题
 * @apiBody {String} description 作业描述
 * @apiBody {Date} deadline 截止日期
 * @apiBody {Number} totalScore 总分
 * @apiBody {Number} [maxAttempts=1] 最大提交次数
 * @apiBody {File[]} [attachments] 附件(最多5个,每个最大10MB)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.assignment 创建的作业
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有创建作业的权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - COURSE_NOT_FOUND: 课程不存在
 * - VALIDATION_ERROR: 输入数据验证失败
 * - FILE_TOO_LARGE: 文件太大
 * - FILE_TYPE_NOT_ALLOWED: 文件类型不允许
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/courses/:courseId/assignments

/**
 * @api {patch} /api/assignments/:id/status 更新作业状态
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 作业ID
 * @apiBody {String} status 作业状态(draft/active/closed)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.assignment 更新后的作业
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "无效的作业状态"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - ASSIGNMENT_NOT_FOUND: 作业不存在
 * - VALIDATION_ERROR: 无效的状态值
 * - INTERNAL_ERROR: 服务器内部错误
 */
PATCH /api/assignments/:id/status

/**
 * @api {post} /api/assignments/:id/submit 提交作业
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 作业ID
 * @apiBody {String} content 作业内容
 * @apiBody {File[]} [attachments] 附件(最多3个,每个最大10MB)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.submission 提交的作业
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ASSIGNMENT_CLOSED",
 *     "message": "作业已截止"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 不是学生角色
 * - ASSIGNMENT_NOT_FOUND: 作业不存在
 * - ASSIGNMENT_CLOSED: 作业已截止
 * - MAX_ATTEMPTS_EXCEEDED: 超过最大提交次数
 * - FILE_TOO_LARGE: 文件太大
 * - FILE_TYPE_NOT_ALLOWED: 文件类型不允许
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/assignments/:id/submit

/**
 * @api {put} /api/assignments/:id/submissions/:submissionId/grade 评分作业
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 作业ID
 * @apiParam {String} submissionId 提交ID
 * @apiBody {Number} score 分数
 * @apiBody {String} [comment] 评语
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.submission 更新后的提交
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有评分权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - ASSIGNMENT_NOT_FOUND: 作业不存在
 * - SUBMISSION_NOT_FOUND: 提交记录不存在
 * - VALIDATION_ERROR: 无效的分数
 * - INTERNAL_ERROR: 服务器内部错误
 */
PUT /api/assignments/:id/submissions/:submissionId/grade
```

### 4.4 选课管理
```javascript
/**
 * @api {post} /api/courses/:courseId/enroll 选修课程
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} courseId 课程ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.enrollment 选课记录
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "COURSE_ALREADY_ENROLLED",
 *     "message": "已经选修过该课程"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 不是学生角色
 * - COURSE_NOT_FOUND: 课程不存在
 * - COURSE_NO_ACCESS: 课程未发布
 * - COURSE_ALREADY_ENROLLED: 已经选修过该课程
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/courses/:courseId/enroll

/**
 * @api {get} /api/enrollments 获取选课列表
 * @apiHeader {String} Authorization Bearer Token
 * @apiQuery {String} [status] 选课状态(enrolled/completed/dropped)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Array} data.enrollments 选课列表
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_REQUIRED",
 *     "message": "需要登录"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - VALIDATION_ERROR: 无效的状态参数
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/enrollments

/**
 * @api {put} /api/enrollments/:id/status 更新选课状态
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 选课记录ID
 * @apiBody {String} status 选课状态(enrolled/completed/dropped)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.enrollment 更新后的选课记录
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "没有权限修改此选课记录"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 没有权限
 * - VALIDATION_ERROR: 无效的状态值
 * - ENROLLMENT_NOT_FOUND: 选课记录不存在
 * - INTERNAL_ERROR: 服务器内部错误
 */
PUT /api/enrollments/:id/status

/**
 * @api {put} /api/enrollments/:id/progress 更新学习进度
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 选课记录ID
 * @apiBody {Number} progress 学习进度(0-100)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.enrollment 更新后的选课记录
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "进度值必须在0-100之间"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 不是学生角色
 * - VALIDATION_ERROR: 无效的进度值
 * - ENROLLMENT_NOT_FOUND: 选课记录不存在
 * - INTERNAL_ERROR: 服务器内部错误
 */
PUT /api/enrollments/:id/progress
```

## 5. 文件管理接口

### 5.1 文件预览和下载
```javascript
/**
 * @api {get} /api/files/preview/:fileId 预览文件
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} fileId 文件ID
 * @apiQuery {String} [type] 文件类型(avatar/cover/resource/attachment)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.file 文件信息和预览URL
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FILE_NOT_FOUND",
 *     "message": "文件不存在"
 *   }
 * }
 * 
 * @apiNote 
 * - 课程封面和用户头像无需权限验证
 * - 章节资源需要已选课或教师权限
 * - 作业附件需要相应的提交/批改权限
 * 
 * 可能的错误码：
 * - FILE_NOT_FOUND: 文件不存在
 * - FILE_NO_ACCESS: 无权访问该文件
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/files/preview/:fileId

/**
 * @api {get} /api/files/download/:fileId 下载文件
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} fileId 文件ID
 * @apiQuery {String} [type] 文件类型(resource/attachment)
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {File} data.file 文件流
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FILE_NOT_FOUND",
 *     "message": "文件不存在"
 *   }
 * }
 * 
 * @apiNote
 * - 仅支持章节资源和作业附件的下载
 * - 需要验证用户是否有权限访问该文件
 * - 下载会记录在系统日志中
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - FILE_NOT_FOUND: 文件不存在
 * - FILE_NO_ACCESS: 无权访问该文件
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/files/download/:fileId

/**
 * @api {get} /api/files/info/:fileId 获取文件信息
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} fileId 文件ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.file 文件详细信息
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FILE_NOT_FOUND",
 *     "message": "文件不存在"
 *   }
 * }
 * 
 * @apiNote
 * - 返回文件的元数据信息
 * - 包括文件名、大小、类型、上传时间等
 * - 需要相应的访问权限
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - FILE_NOT_FOUND: 文件不存在
 * - FILE_NO_ACCESS: 无权访问该文件
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/files/info/:fileId
```

## 6. 管理员接口

### 6.1 用户管理
```javascript
/**
 * @api {get} /api/admin/users 获取用户列表
 * @apiHeader {String} Authorization Bearer Token
 * @apiQuery {Number} [page] 页码
 * @apiQuery {Number} [limit] 每页数量
 * @apiQuery {String} [role] 用户角色
 * @apiQuery {String} [search] 搜索关键词
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Array} data.users 用户列表
 * @apiSuccess {Number} data.total 总数
 * @apiSuccess {Number} data.page 当前页码
 * @apiSuccess {Number} data.pages 总页数
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "需要管理员权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - VALIDATION_ERROR: 无效的查询参数
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/admin/users

/**
 * @api {put} /api/admin/users/:id 更新用户信息
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 用户ID
 * @apiBody {String} [role] 用户角色
 * @apiBody {String} [status] 账号状态
 * @apiBody {Object} [profile] 用户资料
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.user 更新后的用户信息
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "USER_NOT_FOUND",
 *     "message": "用户不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - USER_NOT_FOUND: 用户不存在
 * - VALIDATION_ERROR: 无效的用户数据
 * - INTERNAL_ERROR: 服务器内部错误
 */
PUT /api/admin/users/:id

/**
 * @api {delete} /api/admin/users/:id 删除用户
 * @apiHeader {String} Authorization Bearer Token
 * @apiParam {String} id 用户ID
 * 
 * @apiSuccess {Boolean} success 是否成功
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "USER_NOT_FOUND",
 *     "message": "用户不存在"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - USER_NOT_FOUND: 用户不存在
 * - INTERNAL_ERROR: 服务器内部错误
 */
DELETE /api/admin/users/:id
```

### 6.2 系统管理
```javascript
/**
 * @api {get} /api/admin/statistics 获取系统统计
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Object} data.statistics 统计数据
 * @apiSuccess {Number} data.statistics.userCount 用户总数
 * @apiSuccess {Number} data.statistics.courseCount 课程总数
 * @apiSuccess {Number} data.statistics.enrollmentCount 选课总数
 * @apiSuccess {Object} data.statistics.recentActivity 最近活动
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_NO_PERMISSION",
 *     "message": "需要管理员权限"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/admin/statistics

/**
 * @api {get} /api/admin/logs 获取系统日志
 * @apiHeader {String} Authorization Bearer Token
 * @apiQuery {String} [type] 日志类型(access/error/audit)
 * @apiQuery {String} [startDate] 开始日期
 * @apiQuery {String} [endDate] 结束日期
 * @apiQuery {Number} [page] 页码
 * @apiQuery {Number} [limit] 每页数量
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {Array} data.logs 日志列表
 * @apiSuccess {Number} data.total 总数
 * @apiSuccess {Number} data.page 当前页码
 * @apiSuccess {Number} data.pages 总页数
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "无效的日期格式"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - VALIDATION_ERROR: 无效的查询参数
 * - INTERNAL_ERROR: 服务器内部错误
 */
GET /api/admin/logs

/**
 * @api {post} /api/admin/system/backup 系统备份
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {String} data.backupUrl 备份文件URL
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "SYSTEM_ERROR",
 *     "message": "备份失败"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - SYSTEM_ERROR: 系统错误
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/admin/system/backup

/**
 * @api {post} /api/admin/system/restore 系统恢复
 * @apiHeader {String} Authorization Bearer Token
 * @apiBody {String} backupUrl 备份文件URL
 * 
 * @apiSuccess {Boolean} success 是否成功
 * 
 * @apiError {String} error.code 错误代码
 * @apiError {String} error.message 错误信息
 * 
 * @apiErrorExample {json} 错误响应示例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "SYSTEM_ERROR",
 *     "message": "恢复失败"
 *   }
 * }
 * 
 * 可能的错误码：
 * - AUTH_REQUIRED: 需要登录
 * - AUTH_NO_PERMISSION: 需要管理员权限
 * - VALIDATION_ERROR: 无效的备份文件
 * - SYSTEM_ERROR: 系统错误
 * - INTERNAL_ERROR: 服务器内部错误
 */
POST /api/admin/system/restore
```

## 7. 错误响应格式

所有API的错误响应都遵循以下格式：

```javascript
{
  "success": false,
  "error": {
    "code": String,    // 错误代码
    "message": String  // 错误信息
  }
}
```

### 错误码说明

1. 认证相关 (1xxx)
   - 1001: AUTH_REQUIRED - 未授权访问
   - 1002: AUTH_INVALID_TOKEN - 无效的token
   - 1003: AUTH_TOKEN_EXPIRED - token已过期
   - 1004: AUTH_NO_PERMISSION - 权限不足

2. 用户相关 (2xxx)
   - 2001: USER_NOT_FOUND - 用户不存在
   - 2002: USER_ALREADY_EXISTS - 用户已存在
   - 2003: USER_WRONG_PASSWORD - 密码错误
   - 2004: USER_INVALID_EMAIL - 邮箱格式错误

3. 课程相关 (3xxx)
   - 3001: COURSE_NOT_FOUND - 课程不存在
   - 3002: CHAPTER_NOT_FOUND - 章节不存在
   - 3003: ENROLLMENT_NOT_FOUND - 选课记录不存在
   - 3004: COURSE_INVALID_STATUS - 无效的课程状态
   - 3005: COURSE_ALREADY_ENROLLED - 已经选修过该课程
   - 3006: COURSE_NO_ACCESS - 无权访问该课程

4. 文件相关 (4xxx)
   - 4001: FILE_TOO_LARGE - 文件大小超过限制
   - 4002: FILE_TYPE_NOT_ALLOWED - 不支持的文件类型
   - 4003: FILE_UPLOAD_FAILED - 文件上传失败
   - 4004: FILE_NOT_FOUND - 文件不存在
   - 4005: FILE_NO_ACCESS - 无权访问该文件

5. 数据验证相关 (5xxx)
   - 5001: VALIDATION_ERROR - 数据验证错误
   - 5002: INVALID_INPUT - 无效的输入数据

6. 系统错误 (9xxx)
   - 9001: INTERNAL_ERROR - 内部服务器错误
   - 9002: DATABASE_ERROR - 数据库错误
   - 9003: NETWORK_ERROR - 网络错误
   - 9004: SYSTEM_ERROR - 系统错误 