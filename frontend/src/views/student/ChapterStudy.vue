<template>
  <div class="chapter-study">
    <div v-loading="loading" class="chapter-container">
      <!-- 章节标题区域 -->
      <div class="chapter-header">
        <h2>{{ chapter.title }}</h2>
        <div class="chapter-meta">
          <span class="duration">
            <el-icon><Timer /></el-icon>
            {{ chapter.duration }}分钟
          </span>
          <el-tag 
            :type="chapter.completed ? 'success' : chapter.lastAccessTime ? 'warning' : 'info'"
          >
            {{ chapter.completed ? '已完成' : chapter.lastAccessTime ? '学习中' : '未开始' }}
          </el-tag>
        </div>
      </div>

      <!-- 章节内容区域 -->
      <div class="chapter-content">
        <div class="content-section">
          <h3>章节内容</h3>
          <div class="content-text">{{ chapter.content }}</div>
        </div>

        <!-- 学习资源区域 -->
        <div v-if="chapter.resources?.length" class="resources-section">
          <h3>学习资源</h3>
          <el-table :data="chapter.resources" style="width: 100%">
            <el-table-column prop="title" label="资源名称" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getResourceType(row.type)">
                  {{ getResourceTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  link 
                  type="primary" 
                  @click="handleDownloadResource(row)"
                >
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 完成学习按钮 -->
        <div class="chapter-actions">
          <el-button 
            type="primary" 
            :disabled="chapter.completed"
            @click="handleComplete"
          >
            {{ chapter.completed ? '已完成学习' : '完成学习' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'
import { getChapterDetail } from '@/api/chapter'
import { startStudyChapter, completeChapter } from '@/api/study'

export default {
  name: 'ChapterStudy',
  components: {
    Timer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const chapter = ref({})

    // 获取章节详情
    const fetchChapterDetail = async () => {
      try {
        loading.value = true
        const res = await getChapterDetail(route.params.id)
        if (res.success) {
          chapter.value = res.chapter
          // 开始学习
          await startStudyChapter(route.params.id)
        } else {
          ElMessage.error(res.message || '获取章节详情失败')
        }
      } catch (error) {
        console.error('获取章节详情失败:', error)
        ElMessage.error('获取章节详情失败')
      } finally {
        loading.value = false
      }
    }

    // 获取资源类型样式
    const getResourceType = (type) => {
      const types = {
        document: '',
        video: 'success',
        audio: 'warning',
        other: 'info'
      }
      return types[type] || 'info'
    }

    // 获取资源类型文本
    const getResourceTypeText = (type) => {
      const texts = {
        document: '文档',
        video: '视频',
        audio: '音频',
        other: '其他'
      }
      return texts[type] || '其他'
    }

    // 下载资源
    const handleDownloadResource = (resource) => {
      window.open(resource.url, '_blank')
    }

    // 完成章节学习
    const handleComplete = async () => {
      try {
        const res = await completeChapter(route.params.id)
        if (res.success) {
          ElMessage.success('章节学习完成')
          chapter.value.completed = true
          // 返回课程学习页面并刷新
          router.push({
            name: 'CourseStudy',
            params: { id: chapter.value.courseId._id },
            query: { refresh: Date.now() }
          })
        } else {
          ElMessage.error(res.message || '标记完成失败')
        }
      } catch (error) {
        console.error('标记完成失败:', error)
        ElMessage.error('标记完成失败')
      }
    }

    onMounted(() => {
      fetchChapterDetail()
    })

    return {
      loading,
      chapter,
      getResourceType,
      getResourceTypeText,
      handleDownloadResource,
      handleComplete
    }
  }
}
</script>

<style scoped>
.chapter-study {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.chapter-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  padding: 24px;
}

.chapter-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.chapter-header h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #303133;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #606266;
}

.duration {
  display: flex;
  align-items: center;
  gap: 4px;
}

.content-section,
.resources-section {
  margin-bottom: 24px;
}

.content-section h3,
.resources-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.content-text {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.chapter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style> 