import request from '@/utils/request'

// 选修课程
export function enrollCourse(courseId) {
  return request({
    url: `/enrollments/courses/${courseId}/enroll`,
    method: 'post'
  })
}

// 获取学生的选课列表
export function getStudentCourses(params) {
  return request({
    url: '/enrollments',
    method: 'get',
    params
  })
}

// 更新选课状态
export function updateEnrollmentStatus(id, status) {
  return request({
    url: `/enrollments/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 更新学习进度
export function updateProgress(id, chapterId) {
  return request({
    url: `/enrollments/${id}/progress`,
    method: 'put',
    data: { chapterId }
  })
}

// 获取课程的学生列表
export function getCourseStudents(courseId, params) {
  return request({
    url: `/enrollments/courses/${courseId}/students`,
    method: 'get',
    params
  })
}

// 获取学生的学习详情
export function getEnrollmentDetail(enrollmentId) {
  return request({
    url: `/enrollments/${enrollmentId}/detail`,
    method: 'get'
  })
} 