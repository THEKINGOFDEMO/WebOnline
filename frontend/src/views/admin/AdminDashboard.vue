<template>
  <div class="dashboard">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>用户统计</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.userCount || 0 }}</h2>
            <div class="detail">
              <div>学生：{{ statistics.studentCount || 0 }}</div>
              <div>教师：{{ statistics.teacherCount || 0 }}</div>
              <div>管理员：{{ statistics.adminCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>课程统计</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.courseCount || 0 }}</h2>
            <div class="detail">
              <div>已发布：{{ statistics.publishedCourseCount || 0 }}</div>
              <div>草稿：{{ statistics.draftCourseCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>选课统计</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.enrollmentCount || 0 }}</h2>
            <div class="detail">
              <div>进行中：{{ statistics.activeEnrollmentCount || 0 }}</div>
              <div>已完成：{{ statistics.completedEnrollmentCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>作业统计</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.assignmentCount || 0 }}</h2>
            <div class="detail">
              <div>已提交：{{ statistics.submittedAssignmentCount || 0 }}</div>
              <div>待批改：{{ statistics.pendingAssignmentCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统状态和最近活动区域 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
              <el-tag size="small" :type="statistics.systemStatus?.status === 'normal' ? 'success' : 'danger'">
                {{ statistics.systemStatus?.status === 'normal' ? '运行正常' : '异常' }}
              </el-tag>
            </div>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="label">CPU使用率：</span>
              <el-progress 
                :percentage="statistics.systemStatus?.cpuUsage || 0" 
                :status="statistics.systemStatus?.cpuUsage > 80 ? 'exception' : ''"
              />
            </div>
            <div class="info-item">
              <span class="label">内存使用率：</span>
              <el-progress 
                :percentage="statistics.systemStatus?.memoryUsage || 0"
                :status="statistics.systemStatus?.memoryUsage > 80 ? 'exception' : ''"
              />
            </div>
            <div class="info-item">
              <span class="label">磁盘使用率：</span>
              <el-progress 
                :percentage="statistics.systemStatus?.diskUsage || 0"
                :status="statistics.systemStatus?.diskUsage > 80 ? 'exception' : ''"
              />
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-tabs>
            <el-tab-pane label="用户注册">
              <div class="activity-list">
                <div v-for="(user, index) in statistics.recentActivity?.users" :key="index" class="activity-item">
                  <span class="time">{{ formatDate(user.createdAt) }}</span>
                  <span class="content">
                    新用户 {{ user.username }} 注册为 {{ getRoleLabel(user.role) }}
                  </span>
                </div>
                <el-empty v-if="!statistics.recentActivity?.users?.length" description="暂无数据" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="课程发布">
              <div class="activity-list">
                <div v-for="(course, index) in statistics.recentActivity?.courses" :key="index" class="activity-item">
                  <span class="time">{{ formatDate(course.publishedAt) }}</span>
                  <span class="content">
                    新课程 {{ course.title }} 发布
                  </span>
                </div>
                <el-empty v-if="!statistics.recentActivity?.courses?.length" description="暂无数据" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="选课记录">
              <div class="activity-list">
                <div v-for="(enrollment, index) in statistics.recentActivity?.enrollments" :key="index" class="activity-item">
                  <span class="time">{{ formatDate(enrollment.createdAt) }}</span>
                  <span class="content">
                    学生选修了课程
                  </span>
                </div>
                <el-empty v-if="!statistics.recentActivity?.enrollments?.length" description="暂无数据" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStatistics } from '@/api/admin'

export default {
  name: 'AdminDashboard',
  setup() {
    const statistics = ref({})
    const loading = ref(false)

    // 获取统计数据
    const fetchStatistics = async () => {
      loading.value = true
      try {
        const res = await getStatistics()
        statistics.value = res.data.statistics
      } catch (error) {
        console.error('Fetch statistics error:', error)
        ElMessage.error('获取统计数据失败')
      } finally {
        loading.value = false
      }
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }

    // 获取角色标签
    const getRoleLabel = (role) => {
      const labels = {
        student: '学生',
        teacher: '教师',
        admin: '管理员'
      }
      return labels[role] || role
    }

    onMounted(() => {
      fetchStatistics()
    })

    return {
      statistics,
      loading,
      formatDate,
      getRoleLabel
    }
  }
}
</script>

<style scoped>
.mt-4 {
  margin-top: 20px;
}

.stat-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content h2 {
  margin: 10px 0;
  font-size: 24px;
  color: #303133;
}

.detail {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.system-info {
  padding: 10px;
}

.info-item {
  margin-bottom: 15px;
}

.info-item .label {
  display: inline-block;
  width: 100px;
  color: #606266;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 8px 0;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item .time {
  color: #909399;
  font-size: 13px;
  width: 150px;
}

.activity-item .content {
  flex: 1;
  color: #606266;
}
</style> 