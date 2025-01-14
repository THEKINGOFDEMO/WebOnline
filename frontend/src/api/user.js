import request from '@/utils/request'

// 获取个人信息
export function getProfile() {
  return request({
    url: '/users/profile',
    method: 'get'
  })
}

// 更新个人信息
export function updateProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

// 获取用户设置
export function getSettings() {
  return request({
    url: '/users/settings',
    method: 'get'
  })
}

// 更新用户设置
export function updateSettings(data) {
  return request({
    url: '/users/settings',
    method: 'put',
    data
  })
}

// 上传头像
export function uploadAvatar(data) {
  return request({
    url: '/users/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 删除头像
export function deleteAvatar() {
  return request({
    url: '/users/avatar',
    method: 'delete'
  })
} 