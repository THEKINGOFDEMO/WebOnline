import request from '@/utils/request'

// 获取课程作业列表
export function getCourseAssignments(courseId) {
  return request({
    url: `/assignments/course/${courseId}`,
    method: 'get'
  })
}

// 获取所有作业列表（带筛选）
export function getAssignmentList(params) {
  return request({
    url: '/assignments',
    method: 'get',
    params
  })
}

// 创建作业
export function createAssignment(courseId, data) {
  return request({
    url: `/assignments/course/${courseId}`,
    method: 'post',
    data: {
      ...data,
      courseId  // 确保 courseId 被包含在请求数据中
    }
  })
}

// 获取作业详情
export function getAssignment(id) {
  return request({
    url: `/assignments/${id}`,
    method: 'get'
  })
}

// 更新作业
export function updateAssignment(id, data) {
  return request({
    url: `/assignments/${id}`,
    method: 'put',
    data
  })
}

// 更新作业状态
export function updateAssignmentStatus(id, status) {
  return request({
    url: `/assignments/${id}/status`,
    method: 'patch',
    data: { status }
  })
}

// 删除作业
export function deleteAssignment(id) {
  return request({
    url: `/assignments/${id}`,
    method: 'delete'
  })
}

// 提交作业
export function submitAssignment(id, data) {
  return request({
    url: `/assignments/${id}/submit`,
    method: 'post',
    data
  })
}

// 批改作业
export function gradeSubmission(assignmentId, submissionId, data) {
  return request({
    url: `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    method: 'put',
    data
  })
}

// 上传作业附件
export function uploadAssignmentAttachment(assignmentId, file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: `/assignments/${assignmentId}/attachments`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除作业附件
export function deleteAssignmentAttachment(assignmentId, attachmentId) {
  return request({
    url: `/assignments/${assignmentId}/attachments/${attachmentId}`,
    method: 'delete'
  })
}

// 获取作业提交记录
export function getSubmissions(assignmentId) {
  return request({
    url: `/assignments/${assignmentId}/submissions`,
    method: 'get'
  })
}

// 获取学生的作业列表
export function getStudentAssignments(params) {
  return request({
    url: '/assignments/student',
    method: 'get',
    params
  })
} 