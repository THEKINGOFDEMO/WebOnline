import request from '@/utils/request'

// 获取章节学习状态
export function getChapterStudyStatus(chapterId) {
  return request({
    url: `/study/chapters/${chapterId}/study-status`,
    method: 'get'
  })
}

// 开始学习章节
export function startStudyChapter(chapterId) {
  return request({
    url: `/study/chapters/${chapterId}/start`,
    method: 'post'
  })
}

// 更新学习进度
export function updateStudyProgress(chapterId, data) {
  return request({
    url: `/study/chapters/${chapterId}/progress`,
    method: 'put',
    data
  })
}

// 完成章节学习
export function completeChapter(chapterId) {
  return request({
    url: `/study/chapters/${chapterId}/complete`,
    method: 'post'
  })
} 