<template>
  <div class="course-enroll" v-loading="loading">
    <!-- 课程基本信息 -->
    <div class="course-header" v-if="course">
      <div class="course-cover">
        <el-image :src="course.coverImage ? `/api${course.coverImage}` : ''" fit="cover">
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="course-info">
        <h1 class="course-title">{{ course.title || '加载中...' }}</h1>
        <p class="course-description">{{ course.description || '暂无描述' }}</p>
        <div class="course-meta">
          <span class="meta-item">
            <el-icon><User /></el-icon>
            教师：{{ course.teacherId?.name || '未知' }}
          </span>
          <span class="meta-item">
            <el-tag :type="levelType">{{ levelText }}</el-tag>
          </span>
          <span class="meta-item">
            <el-tag type="info">{{ getCategoryText(course.category) }}</el-tag>
          </span>
        </div>
        <div class="course-action">
          <el-button type="primary" @click="handleEnroll" :loading="enrolling" size="large">
            立即报名
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, User } from '@element-plus/icons-vue'
import { getCourseDetail } from '@/api/course'
import { enrollCourse } from '@/api/enrollment'

export default {
  name: 'CourseEnroll',
  components: {
    Picture,
    User
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const enrolling = ref(false)
    const course = ref({})
    
    const courseId = route.params.id
    
    const levelType = computed(() => {
      const typeMap = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'danger'
      }
      return typeMap[course.value.level] || 'info'
    })

    const levelText = computed(() => {
      const textMap = {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级'
      }
      return textMap[course.value.level] || '未知'
    })

    const getCategoryText = (category) => {
      const categoryMap = {
        'programming': '编程开发',
        'design': '设计创意',
        'business': '商务管理',
        'language': '语言学习',
        'other': '其他课程'
      }
      return categoryMap[category] || '未知分类'
    }

    const fetchCourseDetail = async () => {
      try {
        loading.value = true
        const res = await getCourseDetail(courseId)
        if (res.success) {
          course.value = {
            ...res.course,
            coverImage: res.course?.coverImage?.replace('http://localhost:3000', '') || null,
            teacherId: res.course?.teacherId || {}
          }
        } else {
          ElMessage.error(res.message || '获取课程详情失败')
          router.back()
        }
      } catch (error) {
        console.error('Fetch course detail error:', error)
        ElMessage.error('获取课程详情失败')
        router.back()
      } finally {
        loading.value = false
      }
    }

    const handleEnroll = async () => {
      try {
        enrolling.value = true
        const res = await enrollCourse(courseId)
        if (res.success) {
          ElMessage.success('报名成功')
          router.back()
        } else if (res.message === '您已选修过该课程') {
          // 如果已经报名，给出友好提示
          ElMessage.info('您已报名该课程，可以直接开始学习')
          router.back()
        } else {
          ElMessage.error(res.message || '报名失败')
        }
      } catch (error) {
        console.error('Enroll course error:', error)
        ElMessage.error(error.response?.data?.message || '报名失败')
      } finally {
        enrolling.value = false
      }
    }

    onMounted(() => {
      fetchCourseDetail()
    })

    return {
      loading,
      enrolling,
      course,
      levelType,
      levelText,
      handleEnroll,
      getCategoryText
    }
  }
}
</script>

<style scoped>
.course-enroll {
  padding: 32px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  min-height: calc(100vh - 60px);
}

.course-header {
  display: flex;
  gap: 48px;
  margin-bottom: 24px;
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.course-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.course-cover {
  width: 360px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.course-cover:hover {
  transform: scale(1.02);
}

.course-cover .el-image {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.image-error {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 32px;
  transition: all 0.3s ease;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.course-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  letter-spacing: -0.5px;
}

.course-description {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
  opacity: 0.9;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  padding: 4px 0;
}

.meta-item .el-icon {
  font-size: 18px;
  color: #409eff;
}

.meta-item .el-tag {
  padding: 6px 12px;
  font-weight: 500;
}

.course-action {
  margin-top: auto;
  padding-top: 24px;
}

.course-action .el-button {
  padding: 12px 36px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.course-action .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style> 