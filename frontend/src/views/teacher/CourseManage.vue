<template>
  <div class="course-manage">
    <div class="action-header">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>创建课程
      </el-button>
      
      <div class="filter-container">
        <el-input
          v-model="query.keyword"
          placeholder="搜索课程"
          class="filter-item"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="query.status" placeholder="课程状态" class="filter-item">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已结束" value="ended" />
        </el-select>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="courses"
      style="width: 100%"
      border
    >
      <el-table-column prop="title" label="课程名称" min-width="200">
        <template #default="{ row }">
          <el-link type="primary" @click="handleDetail(row)">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      
      <el-table-column prop="category" label="分类" width="120" />
      
      <el-table-column prop="level" label="难度" width="100">
        <template #default="{ row }">
          <el-tag :type="getLevelType(row.level)">{{ getLevelText(row.level) }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="studentCount" label="学生数" width="100" align="center" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button 
            link 
            :type="row.status === 'published' ? 'warning' : 'success'"
            @click="handleStatusChange(row)"
          >
            {{ row.status === 'published' ? '下架' : '发布' }}
          </el-button>
          <el-popconfirm
            title="确定要删除该课程吗？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :model-value="query.page"
        @update:model-value="val => query.page = val"
        :page-size="query.limit"
        @update:page-size="val => query.limit = val"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getCourses, deleteCourse, updateCourseStatus } from '@/api/course'

export default {
  name: 'CourseManage',
  components: {
    Plus,
    Search
  },
  setup() {
    const router = useRouter()
    const courses = ref([])
    const total = ref(0)
    const loading = ref(false)

    const query = reactive({
      page: 1,
      limit: 10,
      keyword: '',
      status: ''
    })

    const fetchCourses = async () => {
      try {
        loading.value = true
        const res = await getCourses(query)
        courses.value = res.courses
        total.value = res.total
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

    const handleCreate = () => {
      router.push('/teacher/course/create')
    }

    const handleEdit = (row) => {
      router.push(`/teacher/course/${row._id}/edit`)
    }

    const handleDetail = (row) => {
      router.push(`/teacher/course/${row._id}`)
    }

    const handleStatusChange = async (row) => {
      const newStatus = row.status === 'published' ? 'draft' : 'published'
      try {
        await updateCourseStatus(row._id, newStatus)
        ElMessage.success('状态更新成功')
        fetchCourses()
      } catch (error) {
        console.error('Update course status error:', error)
        if (error.response?.data?.message === '课程至少需要一个章节才能发布') {
          ElMessageBox.confirm(
            '发布课程需要至少添加一个章节。是否现在去添加章节？',
            '提示',
            {
              confirmButtonText: '去添加章节',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            router.push(`/teacher/course/${row._id}`)
          }).catch(() => {})
        } else {
          ElMessage.error('状态更新失败')
        }
      }
    }

    const handleDelete = async (row) => {
      try {
        await deleteCourse(row._id)
        ElMessage.success('删除成功')
        fetchCourses()
      } catch (error) {
        console.error('Delete course error:', error)
        ElMessage.error('删除失败')
      }
    }

    const getLevelType = (level) => {
      const typeMap = {
        beginner: 'info',
        intermediate: 'warning',
        advanced: 'danger'
      }
      return typeMap[level] || 'info'
    }

    const getLevelText = (level) => {
      const textMap = {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级'
      }
      return textMap[level] || '未知'
    }

    const getStatusType = (status) => {
      const typeMap = {
        draft: 'info',
        published: 'success',
        ended: 'warning'
      }
      return typeMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const textMap = {
        draft: '草稿',
        published: '已发布',
        ended: '已结束'
      }
      return textMap[status] || '未知'
    }

    onMounted(() => {
      fetchCourses()
    })

    return {
      courses,
      total,
      loading,
      query,
      handleSearch,
      handleCreate,
      handleEdit,
      handleDetail,
      handleStatusChange,
      handleDelete,
      getLevelType,
      getLevelText,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.course-manage {
  padding: 20px;
}

.action-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  gap: 15px;
}

.filter-item {
  width: 200px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 