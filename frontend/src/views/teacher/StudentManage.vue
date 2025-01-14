<template>
  <div class="student-manage">
    <!-- 筛选区域 -->
    <div class="filter-container">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="课程">
          <el-select v-model="query.courseId" placeholder="选择课程" clearable>
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.title"
              :value="course._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 学生列表 -->
    <el-table 
      v-loading="loading"
      :data="students"
      style="width: 100%"
    >
      <el-table-column prop="studentName" label="学生姓名" width="120">
        <template #default="{ row }">
          <div class="student-info">
            <el-avatar 
              :size="24" 
              :src="row.studentAvatar"
              style="vertical-align: middle; margin-right: 8px;"
            />
            {{ row.studentName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="enrollTime" label="选课时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.enrollTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="学习进度" width="200">
        <template #default="{ row }">
          <el-progress :percentage="row.progress" />
        </template>
      </el-table-column>
      <el-table-column prop="lastStudyTime" label="最近学习" width="180">
        <template #default="{ row }">
          {{ formatDate(row.lastStudyTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="completedChapters" label="章节完成" width="120">
        <template #default="{ row }">
          {{ row.completedChapters }}/{{ row.totalChapters }}
        </template>
      </el-table-column>
      <el-table-column prop="completedAssignments" label="作业完成" width="120">
        <template #default="{ row }">
          {{ row.completedAssignments }}/{{ row.totalAssignments }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button 
            link 
            type="primary" 
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 学习详情弹窗 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="学习详情"
      width="800px"
      destroy-on-close
    >
      <div v-loading="detailDialog.loading">
        <!-- 基本信息 -->
        <div class="student-detail-header">
          <el-avatar 
            :size="64" 
            :src="detailDialog.data.studentAvatar"
          />
          <div class="student-detail-info">
            <h3>{{ detailDialog.data.studentName }}</h3>
            <p>选课时间：{{ formatDate(detailDialog.data.enrollTime) }}</p>
            <p>学习进度：{{ detailDialog.data.progress }}%</p>
            <p>最近学习：{{ formatDate(detailDialog.data.lastStudyTime) }}</p>
          </div>
        </div>

        <!-- 章节学习情况 -->
        <div class="detail-section">
          <h4>章节学习情况</h4>
          <el-table :data="detailDialog.chapters" style="width: 100%">
            <el-table-column prop="title" label="章节名称" min-width="200" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getChapterStatusType(row.status)">
                  {{ getChapterStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="180">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" />
              </template>
            </el-table-column>
            <el-table-column prop="lastStudyTime" label="最近学习时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.lastStudyTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 作业完成情况 -->
        <div class="detail-section">
          <h4>作业完成情况</h4>
          <el-table :data="detailDialog.assignments" style="width: 100%">
            <el-table-column prop="title" label="作业标题" min-width="200" />
            <el-table-column prop="submitTime" label="提交时间" width="180">
              <template #default="{ row }">
                {{ row.submitTime ? formatDate(row.submitTime) : '未提交' }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="得分" width="100">
              <template #default="{ row }">
                <template v-if="row.submitTime">
                  {{ row.graded ? row.score : '待批改' }}
                </template>
                <template v-else>-</template>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getSubmissionStatusType(row)">
                  {{ getSubmissionStatusText(row) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCourses } from '@/api/course'
import { 
  getCourseStudents,
  getEnrollmentDetail
} from '@/api/enrollment'

export default {
  name: 'StudentManage',
  setup() {
    const loading = ref(false)
    const courses = ref([])
    const students = ref([])
    const total = ref(0)

    const query = reactive({
      page: 1,
      limit: 10,
      courseId: ''
    })

    // 获取教师的课程列表
    const fetchCourses = async () => {
      try {
        const res = await getCourses({ role: 'teacher' })
        if (res.success) {
          courses.value = res.courses
        } else {
          ElMessage.error(res.message || '获取课程列表失败')
        }
      } catch (error) {
        console.error('获取课程列表错误:', error)
        ElMessage.error('获取课程列表失败')
      }
    }

    // 获取学生列表
    const fetchStudents = async () => {
      if (!query.courseId) {
        students.value = []
        total.value = 0
        return
      }

      try {
        loading.value = true
        const res = await getCourseStudents(query.courseId, {
          page: query.page,
          limit: query.limit
        })
        if (res.success) {
          students.value = res.students
          total.value = res.total
        } else {
          ElMessage.error(res.message || '获取学生列表失败')
        }
      } catch (error) {
        console.error('获取学生列表错误:', error)
        ElMessage.error('获取学生列表失败')
      } finally {
        loading.value = false
      }
    }

    // 学习详情弹窗数据
    const detailDialog = reactive({
      visible: false,
      loading: false,
      data: {
        studentName: '',
        studentAvatar: '',
        studentEmail: '',
        enrollTime: null,
        progress: 0,
        lastStudyTime: null,
        status: ''
      },
      chapters: [],
      assignments: []
    })

    // 查看学习详情
    const handleViewDetail = async (row) => {
      try {
        detailDialog.visible = true;
        detailDialog.loading = true;
        
        // 初始化基本数据
        detailDialog.data = {
          studentName: row.studentName,
          studentAvatar: row.studentAvatar,
          studentEmail: '',
          enrollTime: row.enrollTime,
          progress: row.progress,
          lastStudyTime: row.lastStudyTime,
          status: ''
        };
        detailDialog.chapters = [];
        detailDialog.assignments = [];
        
        // 获取详细数据
        const res = await getEnrollmentDetail(row.enrollmentId);
        if (res.success) {
          detailDialog.data = res.data;
          detailDialog.chapters = res.data.chapters;
          detailDialog.assignments = res.data.assignments;
        } else {
          ElMessage.error(res.message || '获取学习详情失败');
        }
      } catch (error) {
        console.error('获取学习详情错误:', error);
        ElMessage.error('获取学习详情失败');
      } finally {
        detailDialog.loading = false;
      }
    };

    // 获取章节状态类型
    const getChapterStatusType = (status) => {
      const typeMap = {
        not_started: 'info',
        in_progress: 'warning',
        completed: 'success'
      };
      return typeMap[status] || 'info';
    };

    // 获取章节状态文本
    const getChapterStatusText = (status) => {
      const textMap = {
        not_started: '未开始',
        in_progress: '学习中',
        completed: '已完成'
      };
      return textMap[status] || '未知';
    };

    // 获取作业状态类型
    const getSubmissionStatusType = (submission) => {
      if (!submission.submitTime) return 'info';
      if (!submission.graded) return 'warning';
      return 'success';
    };

    // 获取作业状态文本
    const getSubmissionStatusText = (submission) => {
      if (!submission.submitTime) return '未提交';
      if (!submission.graded) return '待批改';
      return '已完成';
    };

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '暂无';
      return new Date(date).toLocaleString();
    };

    // 处理筛选
    const handleFilter = () => {
      query.page = 1;
      fetchStudents();
    };

    // 重置筛选
    const resetFilter = () => {
      query.courseId = '';
      query.page = 1;
      students.value = [];
      total.value = 0;
    };

    // 处理页码变化
    const handleCurrentChange = (val) => {
      query.page = val;
      fetchStudents();
    };

    // 处理每页数量变化
    const handleSizeChange = (val) => {
      query.limit = val;
      query.page = 1;
      fetchStudents();
    };

    onMounted(() => {
      fetchCourses();
    });

    return {
      loading,
      courses,
      students,
      total,
      query,
      detailDialog,
      handleViewDetail,
      handleFilter,
      resetFilter,
      handleCurrentChange,
      handleSizeChange,
      formatDate,
      getChapterStatusType,
      getChapterStatusText,
      getSubmissionStatusType,
      getSubmissionStatusText
    };
  }
}
</script>

<style scoped>
.student-manage {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.student-info {
  display: flex;
  align-items: center;
}

.student-detail-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
}

.student-detail-info {
  margin-left: 16px;
}

.student-detail-info h3 {
  margin: 0 0 8px 0;
}

.student-detail-info p {
  margin: 4px 0;
  color: var(--el-text-color-secondary);
}

.detail-section {
  margin-top: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}
</style> 