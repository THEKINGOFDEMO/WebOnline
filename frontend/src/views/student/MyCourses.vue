<template>
  <div class="my-courses">
    <div class="filter-container">
      <el-select v-model="query.status" placeholder="学习状态" class="filter-item">
        <el-option label="全部" value="" />
        <el-option label="学习中" value="learning" />
        <el-option label="已完成" value="completed" />
      </el-select>
    </div>

    <div v-loading="loading" class="course-list">
      <el-empty v-if="!loading && courseList.length === 0" description="暂无课程" />
      <el-row v-else :gutter="20">
        <el-col 
          v-for="course in courseList" 
          :key="course._id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
          class="course-item"
        >
          <enrolled-course-card :course="course" />
        </el-col>
      </el-row>
    </div>

    <div v-if="courseList.length > 0" class="pagination-container">
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
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import EnrolledCourseCard from '@/components/business/EnrolledCourseCard.vue'
import { getStudentCourses } from '@/api/enrollment'

export default {
  name: 'MyCourses',
  components: {
    EnrolledCourseCard
  },
  setup() {
    const courseList = ref([])
    const total = ref(0)
    const loading = ref(false)

    const query = reactive({
      page: 1,
      limit: 12,
      status: ''
    })

    const fetchCourses = async () => {
      try {
        loading.value = true
        const res = await getStudentCourses(query)
        if (res.success) {
          courseList.value = res.enrollments.map(enrollment => ({
            _id: enrollment.courseId._id,
            title: enrollment.courseId.title,
            coverImage: enrollment.courseId.coverImage?.replace('http://localhost:3000', ''),
            progress: enrollment.progress || 0,
            teacherName: enrollment.courseId.teacherId?.name || '未知教师'
          }))
          total.value = res.total || courseList.value.length
        } else {
          ElMessage.error(res.message || '获取课程列表失败')
        }
      } catch (error) {
        console.error('获取课程列表失败:', error)
        ElMessage.error('获取课程列表失败')
      } finally {
        loading.value = false
      }
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

    onMounted(() => {
      fetchCourses()
    })

    return {
      query,
      courseList,
      total,
      loading,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.my-courses {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.filter-item {
  width: 200px;
}

.course-list {
  min-height: 300px;
}

.course-item {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 