// 用户相关操作
const USER_ACTIONS = {
  REGISTER: 'USER_REGISTER',
  LOGIN: 'USER_LOGIN',
  LOGOUT: 'USER_LOGOUT',
  UPDATE_PASSWORD: 'USER_UPDATE_PASSWORD',
  UPDATE_PROFILE: 'USER_UPDATE_PROFILE'
};

// 课程相关操作
const COURSE_ACTIONS = {
  CREATE: 'COURSE_CREATE',
  UPDATE: 'COURSE_UPDATE',
  DELETE: 'COURSE_DELETE',
  STATUS_CHANGE: 'COURSE_STATUS_CHANGE',
  COVER_UPDATE: 'COURSE_COVER_UPDATE'
};

// 章节相关操作
const CHAPTER_ACTIONS = {
  CREATE: 'CHAPTER_CREATE',
  UPDATE: 'CHAPTER_UPDATE',
  RESOURCE_UPLOAD: 'CHAPTER_RESOURCE_UPLOAD',
  RESOURCE_DELETE: 'CHAPTER_RESOURCE_DELETE'
};

// 选课相关操作
const ENROLLMENT_ACTIONS = {
  ENROLL: 'COURSE_ENROLL',
  UPDATE_STATUS: 'ENROLLMENT_STATUS_UPDATE',
  UPDATE_PROGRESS: 'ENROLLMENT_PROGRESS_UPDATE'
};

// 作业相关操作
const ASSIGNMENT_ACTIONS = {
  CREATE: 'ASSIGNMENT_CREATE',
  SUBMIT: 'ASSIGNMENT_SUBMIT',
  GRADE: 'ASSIGNMENT_GRADE',
  STATUS_UPDATE: 'ASSIGNMENT_STATUS_UPDATE'
};

// 管理员操作
const ADMIN_ACTIONS = {
  USER_UPDATE: 'ADMIN_USER_UPDATE',
  USER_DELETE: 'ADMIN_USER_DELETE',
  SYSTEM_BACKUP: 'ADMIN_SYSTEM_BACKUP',
  SYSTEM_RESTORE: 'ADMIN_SYSTEM_RESTORE',
  SYSTEM_BACKUP_DELETE: 'ADMIN_SYSTEM_BACKUP_DELETE'
};

module.exports = {
  USER_ACTIONS,
  COURSE_ACTIONS,
  CHAPTER_ACTIONS,
  ENROLLMENT_ACTIONS,
  ASSIGNMENT_ACTIONS,
  ADMIN_ACTIONS
}; 