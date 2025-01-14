import request from '@/utils/request'

// 获取用户列表
export function getUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

// 修改用户信息
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

// 获取系统统计数据
export function getStatistics() {
  return request({
    url: '/admin/statistics',
    method: 'get'
  })
}

// 获取系统日志
export function getLogs(params) {
  return request({
    url: '/admin/logs',
    method: 'get',
    params
  })
}

// 系统备份
export function backupSystem() {
  return request({
    url: '/admin/system/backup',
    method: 'post'
  })
}

// 系统恢复
export function restoreSystem(data) {
  return request({
    url: '/admin/system/restore',
    method: 'post',
    data
  })
}

// 获取备份列表
export function getBackups() {
  return request({
    url: '/admin/backups',
    method: 'get'
  })
}

// 删除备份
export function deleteBackup(data) {
  return request({
    url: '/admin/backup',
    method: 'delete',
    data
  })
} 