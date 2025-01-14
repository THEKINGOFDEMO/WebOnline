import request from '@/utils/request'

// 获取文件信息
export function getFileInfo(fileId) {
  return request({
    url: `/files/info/${fileId}`,
    method: 'get'
  })
}

// 预览文件
export function previewFile(fileId) {
  return request({
    url: `/files/preview/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 下载文件
export function downloadFile(fileId) {
  return request({
    url: `/files/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
} 