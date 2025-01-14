<template>
  <div class="course-card" @click="$emit('click')">
    <div class="cover-image">
      <el-image 
        :src="course.coverImage ? course.coverImage.replace('/uploads', '/api/uploads') : 'https://via.placeholder.com/400x160?text=暂无封面'" 
        fit="cover"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span style="margin-left: 8px">暂无封面</span>
          </div>
        </template>
      </el-image>
    </div>
    <span class="course-level">{{ getLevelText(course.level) }}</span>
    <span class="course-category">{{ getCategoryText(course.category) }}</span>
    
    <div class="course-info">
      <h3 class="course-title">{{ course.title }}</h3>
      
      <div class="teacher-info">
        <img 
          class="teacher-avatar" 
          :src="course.teacherId?.avatar ? course.teacherId.avatar.replace('/uploads', '/api/uploads') : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
          :alt="course.teacherId?.name"
        >
        <span class="teacher-name">{{ course.teacherId?.name || '未知教师' }}</span>
      </div>
      
      <div class="course-stats">
        <div class="stats-item">
          <el-icon><User /></el-icon>
          {{ course.studentCount || 0 }} 名学员
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, Picture } from '@element-plus/icons-vue'

defineProps({
  course: {
    type: Object,
    required: true
  }
})

const getLevelText = (level) => {
  const levelMap = {
    'beginner': '入门',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return levelMap[level] || '未知'
}

const getCategoryText = (category) => {
  const categoryMap = {
    'programming': '编程开发',
    'design': '设计创意',
    'business': '商务管理',
    'language': '语言学习',
    'other': '其他课程'
  }
  return categoryMap[category] || '未知'
}
</script>

<style scoped>
.course-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  position: relative;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.cover-image {
  width: 100%;
  height: 160px;
  position: relative;
}

.cover-image .el-image {
  width: 100%;
  height: 100%;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.course-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.teacher-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.teacher-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.teacher-name {
  font-size: 14px;
  color: #606266;
}

.course-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.stats-item {
  font-size: 13px;
  color: #909399;
  display: flex;
  align-items: center;
}

.stats-item .el-icon {
  margin-right: 4px;
}

.course-category {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  background: rgba(0,0,0,0.5);
}

.course-level {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  background: rgba(0,0,0,0.5);
}
</style> 