<template>
  <div class="course-square">
    <div class="welcome-banner">
      <h1>探索你的学习之旅</h1>
      <p>在这里发现令人兴奋的课程，开启你的成长之路 🚀</p>
    </div>

    <div class="search-section">
      <div class="filter-container">
        <el-input
          v-model="query.keyword"
          placeholder="搜索感兴趣的课程..."
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="query.category" placeholder="课程分类" clearable>
          <el-option label="编程开发" value="programming" />
          <el-option label="设计创意" value="design" />
          <el-option label="商务管理" value="business" />
          <el-option label="语言学习" value="language" />
          <el-option label="其他课程" value="other" />
        </el-select>
        
        <el-select v-model="query.level" placeholder="难度等级" clearable>
          <el-option label="入门" value="beginner" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="advanced" />
        </el-select>
        
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="courses-section" v-loading="loading">
      <div v-if="courseList.length === 0 && !loading" class="empty-tip">
        暂无课程
      </div>
      <div v-else class="courses-grid">
        <course-card
          v-for="course in courseList"
          :key="course._id"
          :course="course"
          @click="handleCourseClick(course)"
        />
      </div>
      
      <div class="pagination">
        <el-pagination
          :current-page="query.page"
          :page-size="query.limit"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getCourses } from '@/api/course'
import CourseCard from '@/components/business/CourseCard.vue'

const router = useRouter()
const loading = ref(false)
const courseList = ref([])
const total = ref(0)

const query = reactive({
  keyword: '',
  category: '',
  level: '',
  page: 1,
  limit: 12
})

const fetchCourses = async () => {
  try {
    loading.value = true
    const res = await getCourses(query)
    console.log('API response:', res)
    courseList.value = res.courses || []
    total.value = res.total || 0
  } catch (error) {
    console.error('Fetch courses error:', error)
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.page = 1
  fetchCourses()
}

const handleReset = () => {
  query.keyword = ''
  query.category = ''
  query.level = ''
  query.page = 1
  fetchCourses()
}

const handleSizeChange = (val) => {
  query.limit = val
  query.page = 1
  fetchCourses()
}

const handleCurrentChange = (val) => {
  query.page = val
  fetchCourses()
}

const handleCourseClick = (course) => {
  router.push({
    name: 'CourseEnroll',
    params: { id: course._id }
  })
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.course-square {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.welcome-banner {
  margin-bottom: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.welcome-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.welcome-desc {
  font-size: 16px;
  opacity: 0.9;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filter-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.courses-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.empty-tip {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 80px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 1200px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-item {
    min-width: 100%;
  }
}
</style> 