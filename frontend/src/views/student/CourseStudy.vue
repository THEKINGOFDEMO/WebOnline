<template>
  <div class="course-study" v-loading="loading">
    <!-- 课程基本信息 -->
    <div class="course-header" v-if="course">
      <div class="course-cover">
        <el-image 
          :src="getCoverImageUrl"
          fit="cover"
          :preview-src-list="course.coverImage ? [getCoverImageUrl] : []"
        >
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
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>教师：{{ course.teacherId?.name || '未知' }}</span>
          </div>
          <div class="meta-item">
            <el-tag :type="levelType" size="small">{{ levelText }}</el-tag>
          </div>
          <div class="meta-item">
            <el-tag type="info" size="small">{{ getCategoryText(course.category) }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="course-main">
      <!-- 章节列表 -->
      <div class="course-content">
        <div class="section-header">
          <h2 class="section-title">课程章节</h2>
          <div class="progress-info">
            <el-progress 
              :percentage="Math.round((enrollment?.completedChapters?.length || 0) / chapters.length * 100) || 0" 
              :status="enrollment?.completedChapters?.length === chapters.length ? 'success' : ''"
              :stroke-width="8"
              class="progress-bar"
            />
            <span class="progress-text">
              已完成 {{ enrollment?.completedChapters?.length || 0 }}/{{ chapters.length }} 章节
            </span>
          </div>
        </div>

        <el-collapse v-model="activeChapters" class="chapter-list">
          <el-collapse-item 
            v-for="chapter in chapters" 
            :key="chapter._id" 
            :name="chapter._id"
          >
            <template #title>
              <div class="chapter-header">
                <span class="chapter-title">{{ chapter.title }}</span>
                <span class="chapter-duration">{{ chapter.duration }}分钟</span>
              </div>
            </template>

            <div class="chapter-content">
              <p class="chapter-description">{{ chapter.description }}</p>
              
              <div class="chapter-resources" v-if="chapter.resources && chapter.resources.length">
                <h4 class="resources-title">
                  <el-icon><Document /></el-icon>
                  学习资料
                </h4>
                <ul class="resources-list">
                  <li v-for="resource in chapter.resources" :key="resource._id">
                    <el-button 
                      link 
                      type="primary" 
                      @click="handleDownload(resource)"
                    >
                      <el-icon><Download /></el-icon>
                      {{ resource.filename }}
                    </el-button>
                  </li>
                </ul>
              </div>

              <div class="chapter-actions">
                <el-button 
                  type="primary" 
                  :icon="VideoPlay"
                  @click="handleStudy(chapter)"
                  :disabled="!chapter.content"
                >
                  开始学习
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, User, Download, VideoPlay, Document } from '@element-plus/icons-vue'
import { getCourseDetail } from '@/api/course'
import { getCourseChapters } from '@/api/chapter'
import { getEnrollmentDetail } from '@/api/enrollment'

export default {
  name: 'CourseStudy',
  components: {
    Picture,
    User,
    Download,
    Document
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const course = ref({})
    const chapters = ref([])
    const enrollment = ref(null)
    const activeChapters = ref([])

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
        const res = await getCourseDetail(courseId, false)
        if (res.success) {
          console.log('课程详情原始数据:', res.course)
          course.value = {
            ...res.course,
            coverImage: res.course?.coverImage?.replace('http://localhost:3000', '') || null,
            teacherId: res.course?.teacherId || {}
          }
          console.log('处理后的课程数据:', course.value)
          if (res.enrollment?._id) {
            const enrollRes = await getEnrollmentDetail(res.enrollment._id)
            if (enrollRes.success) {
              enrollment.value = enrollRes.data
              console.log('选课信息:', enrollment.value)
            }
          }
        } else {
          ElMessage.error(res.message || '获取课程详情失败')
        }
      } catch (error) {
        console.error('Fetch course detail error:', error)
        ElMessage.error('获取课程详情失败')
      } finally {
        loading.value = false
      }
    }

    const fetchChapters = async () => {
      try {
        const res = await getCourseChapters(courseId)
        if (res.success) {
          chapters.value = res.chapters || []
          console.log('章节列表:', chapters.value)
        }
      } catch (error) {
        console.error('Fetch chapters error:', error)
        ElMessage.error('获取章节列表失败')
      }
    }

    const handleStudy = (chapter) => {
      router.push({
        name: 'ChapterStudy',
        params: { id: chapter._id }
      })
    }

    const handleDownload = (resource) => {
      // 调用下载接口
      ElMessage.info('开始下载：' + resource.filename)
    }

    const getCoverImageUrl = computed(() => {
      if (!course.value?.coverImage) {
        console.warn('无法获取课程封面图片URL，coverImage:', course.value?.coverImage)
        return ''
      }
      return `/api${course.value.coverImage}`
    })

    onMounted(() => {
      fetchCourseDetail()
      fetchChapters()
    })

    // 监听路由变化，处理刷新
    watch(() => route.query.refresh, (newVal) => {
      if (newVal) {
        fetchCourseDetail()
        fetchChapters()
      }
    })

    return {
      loading,
      course,
      chapters,
      enrollment,
      activeChapters,
      levelType,
      levelText,
      handleStudy,
      handleDownload,
      VideoPlay,
      getCategoryText,
      getCoverImageUrl
    }
  }
}
</script>

<style scoped>
.course-study {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.course-header {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.course-cover {
  width: 320px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.course-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-error {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.course-description {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.course-main {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-bar {
  width: 200px;
}

.progress-text {
  font-size: 14px;
  color: #606266;
}

.chapter-list {
  border: none;
}

.chapter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.chapter-title {
  font-weight: 500;
  color: #303133;
}

.chapter-duration {
  font-size: 14px;
  color: #909399;
}

.chapter-content {
  padding: 16px;
  background: #f8f9fb;
  border-radius: 8px;
}

.chapter-description {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.chapter-resources {
  margin-top: 20px;
}

.resources-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  font-size: 15px;
  color: #303133;
}

.resources-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.resources-list li {
  margin-bottom: 8px;
}

.chapter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  padding: 16px;
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding: 0 16px 16px;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.el-collapse) {
  border: none;
}
</style> 