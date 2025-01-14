import request from '@/utils/request'

// 获取课程列表（支持分页、搜索、分类筛选）
export function getCourses(params) {
  return request({
    url: '/courses',
    method: 'get',
    params
  })
}

// 创建课程（教师）
export function createCourse(data) {
  return request({
    url: '/courses',
    method: 'post',
    data
  })
}

// 获取课程详情
export function getCourseDetail(id, isEdit = true) {
  return request({
    url: `/courses/${id}`,
    method: 'get',
    params: { edit: isEdit }
  })
}

// 更新课程信息（教师）
export function updateCourse(id, data) {
  return request({
    url: `/courses/${id}`,
    method: 'put',
    data
  })
}

// 删除课程（教师）
export function deleteCourse(id) {
  return request({
    url: `/courses/${id}`,
    method: 'delete'
  })
}

// 更新课程状态（教师）
export function updateCourseStatus(id, status) {
  return request({
    url: `/courses/${id}/status`,
    method: 'patch',
    data: { status }
  })
}

// 更新课程封面（教师）
export function updateCourseCover(id, data) {
  return request({
    url: `/courses/${id}/cover`,
    method: 'patch',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
} 