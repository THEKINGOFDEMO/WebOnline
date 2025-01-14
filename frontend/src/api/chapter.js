import request from '@/utils/request'

// 获取课程的所有章节
export function getCourseChapters(courseId) {
  return request({
    url: `/courses/${courseId}/chapters`,
    method: 'get'
  })
}

// 创建章节（教师）
export function createChapter(courseId, data) {
  return request({
    url: `/courses/${courseId}/chapters`,
    method: 'post',
    data
  })
}

// 获取章节详情
export function getChapterDetail(id) {
  return request({
    url: `/chapters/${id}`,
    method: 'get'
  })
}

// 更新章节（教师）
export function updateChapter(id, data) {
  return request({
    url: `/chapters/${id}`,
    method: 'put',
    data
  })
}

// 删除章节（教师）
export function deleteChapter(id) {
  return request({
    url: `/chapters/${id}`,
    method: 'delete'
  })
}

// 上传章节资源（教师）
export function uploadChapterResource(id, data) {
  return request({
    url: `/chapters/${id}/resources`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 删除章节资源（教师）
export function deleteChapterResource(id, resourceId) {
  return request({
    url: `/chapters/${id}/resources/${resourceId}`,
    method: 'delete'
  })
} 