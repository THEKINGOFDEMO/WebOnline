<template>
  <div class="my-assignments">
    <div class="filter-container">
      <el-select v-model="query.status" placeholder="提交状态" class="filter-item">
        <el-option label="全部" value="" />
        <el-option label="未提交" value="not_submitted" />
        <el-option label="已提交" value="submitted" />
        <el-option label="已批改" value="graded" />
      </el-select>
    </div>

    <div class="assignment-list">
      <el-card v-for="assignment in assignments" :key="assignment._id" class="assignment-item">
        <div class="assignment-header">
          <h3 class="assignment-title">{{ assignment.title }}</h3>
          <el-tag :type="getStatusType(assignment.status)">{{ getStatusText(assignment.status) }}</el-tag>
        </div>
        
        <div class="assignment-info">
          <p class="assignment-description">{{ assignment.description }}</p>
          <div class="assignment-meta">
            <span class="course-name">
              <el-icon><Reading /></el-icon>
              {{ assignment.courseTitle || '未知课程' }}
            </span>
            <span class="deadline">
              <el-icon><Timer /></el-icon>
              截止日期：{{ formatDate(assignment.deadline) }}
            </span>
            <span class="score" v-if="assignment.score !== undefined && assignment.score !== null">
              <el-icon><StarFilled /></el-icon>
              得分：{{ assignment.score }}/{{ assignment.totalScore }}
            </span>
          </div>
        </div>

        <div class="assignment-attachments" v-if="assignment.attachments && assignment.attachments.length">
          <h4>作业附件：</h4>
          <ul>
            <li v-for="attachment in assignment.attachments" :key="attachment._id">
              <el-button link type="primary" @click="handleDownload(attachment)">
                <el-icon><Download /></el-icon>
                {{ attachment.title }}
              </el-button>
            </li>
          </ul>
        </div>

        <div class="assignment-footer">
          <div class="submission-info" v-if="assignment.submission">
            <p>提交时间：{{ formatDate(assignment.submission.submitTime) }}</p>
            <el-button link type="primary" @click="handleViewSubmission(assignment)">
              查看提交内容
            </el-button>
          </div>
          <div class="action-buttons">
            <el-button 
              type="primary" 
              @click="handleSubmit(assignment)"
              :disabled="assignment.status === 'graded'"
            >
              {{ assignment.submission ? '重新提交' : '提交作业' }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 提交作业对话框 -->
    <el-dialog
      v-model="submitDialogVisible"
      title="提交作业"
      width="500px"
    >
      <el-form ref="submitForm" :model="submitForm" label-width="80px">
        <el-form-item label="作业文件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传作业文件（支持 PDF、Word、ZIP 格式）
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="submitForm.comment"
            type="textarea"
            rows="3"
            placeholder="请输入作业说明（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="submitDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmit" :loading="submitting">
            确认提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看提交内容对话框 -->
    <el-dialog
      v-model="viewSubmissionDialogVisible"
      title="提交详情"
      width="500px"
    >
      <div class="submission-detail">
        <div class="submission-time">
          <h4>提交时间</h4>
          <p>{{ formatDate(currentSubmission?.submitTime) }}</p>
        </div>
        
        <div class="submission-content">
          <h4>提交说明</h4>
          <p>{{ currentSubmission?.content || '无' }}</p>
        </div>

        <div class="submission-attachments" v-if="currentSubmission?.attachments?.length">
          <h4>提交的文件</h4>
          <ul>
            <li v-for="attachment in currentSubmission.attachments" :key="attachment._id">
              <el-button link type="primary" @click="handleDownload(attachment)">
                <el-icon><Download /></el-icon>
                {{ attachment.title }}
              </el-button>
            </li>
          </ul>
        </div>

        <div class="submission-grade" v-if="currentSubmission?.status === 'graded'">
          <h4>评分信息</h4>
          <p>得分：{{ currentSubmission.score }}/{{ currentAssignment?.totalScore }}</p>
          <p v-if="currentSubmission.comment">教师评语：{{ currentSubmission.comment }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Reading, Timer, StarFilled, Download } from '@element-plus/icons-vue'
import { getStudentAssignments, submitAssignment } from '@/api/assignment'

export default {
  name: 'MyAssignments',
  components: {
    Reading,
    Timer,
    StarFilled,
    Download
  },
  setup() {
    const assignments = ref([])
    const total = ref(0)
    const loading = ref(false)
    const submitting = ref(false)
    const submitDialogVisible = ref(false)
    const currentAssignment = ref(null)
    const viewSubmissionDialogVisible = ref(false)
    const currentSubmission = ref(null)

    const query = reactive({
      page: 1,
      limit: 10,
      status: ''
    })

    const submitForm = reactive({
      file: null,
      comment: ''
    })

    const fetchAssignments = async () => {
      try {
        loading.value = true
        const params = {
          page: query.page,
          limit: query.limit
        }
        if (query.status) {
          params.status = query.status
        }
        const res = await getStudentAssignments(params)
        assignments.value = res.assignments
        total.value = res.total
      } catch (error) {
        console.error('Fetch assignments error:', error)
        ElMessage.error('获取作业列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSizeChange = (val) => {
      query.limit = val
      fetchAssignments()
    }

    const handleCurrentChange = (val) => {
      query.page = val
      fetchAssignments()
    }

    const handleSubmit = (assignment) => {
      currentAssignment.value = assignment
      submitForm.file = null
      submitForm.comment = ''
      submitDialogVisible.value = true
    }

    const handleFileChange = (file) => {
      submitForm.file = file.raw
    }

    const confirmSubmit = async () => {
      if (!submitForm.file) {
        ElMessage.warning('请选择要提交的文件')
        return
      }

      try {
        submitting.value = true
        const formData = new FormData()
        formData.append('file', submitForm.file)
        formData.append('content', submitForm.comment || '无备注')
        
        const res = await submitAssignment(currentAssignment.value._id, formData)
        ElMessage.success('作业提交成功')
        submitDialogVisible.value = false
        
        // 更新当前作业的提交状态
        const index = assignments.value.findIndex(a => a._id === currentAssignment.value._id)
        if (index !== -1) {
          assignments.value[index].status = 'submitted'
          assignments.value[index].submission = res.submission
        }
        
        // 如果当前在筛选状态，重新获取列表
        if (query.status) {
          fetchAssignments()
        }
      } catch (error) {
        console.error('Submit assignment error:', error)
        ElMessage.error(error.response?.data?.message || '作业提交失败')
      } finally {
        submitting.value = false
      }
    }

    const handleDownload = (attachment) => {
      if (attachment.url) {
        window.open(attachment.url, '_blank')
      } else {
        ElMessage.warning('附件链接不可用')
      }
    }

    const handleViewSubmission = (assignment) => {
      if (assignment.submission) {
        currentAssignment.value = assignment
        currentSubmission.value = assignment.submission
        viewSubmissionDialogVisible.value = true
      }
    }

    const getStatusType = (status) => {
      const typeMap = {
        not_submitted: 'warning',
        submitted: 'primary',
        graded: 'success',
        published: 'info'
      }
      return typeMap[status] || 'info'
    }

    const getStatusText = (status) => {
      const textMap = {
        not_submitted: '未提交',
        submitted: '已提交',
        graded: '已批改',
        published: '进行中'
      }
      return textMap[status] || '未知'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    watch(() => query.status, () => {
      query.page = 1
      fetchAssignments()
    })

    onMounted(() => {
      fetchAssignments()
    })

    return {
      assignments,
      total,
      query,
      loading,
      submitting,
      submitDialogVisible,
      submitForm,
      handleSizeChange,
      handleCurrentChange,
      handleSubmit,
      handleFileChange,
      confirmSubmit,
      handleDownload,
      handleViewSubmission,
      getStatusType,
      getStatusText,
      formatDate,
      viewSubmissionDialogVisible,
      currentSubmission
    }
  }
}
</script>

<style scoped>
.my-assignments {
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

.assignment-item {
  margin-bottom: 20px;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.assignment-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.assignment-description {
  margin: 0 0 15px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.assignment-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

.assignment-meta .el-icon {
  margin-right: 4px;
}

.assignment-attachments {
  margin: 15px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.assignment-attachments h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #303133;
}

.assignment-attachments ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.assignment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.submission-info {
  font-size: 14px;
  color: #606266;
}

.submission-info p {
  margin: 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.upload-demo {
  margin-bottom: 10px;
}

.submission-detail {
  padding: 20px;
}

.submission-detail h4 {
  margin-bottom: 10px;
  color: #606266;
}

.submission-detail > div {
  margin-bottom: 20px;
}

.submission-detail p {
  margin: 5px 0;
  color: #303133;
}

.submission-attachments ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.submission-attachments li {
  margin: 5px 0;
}

.submission-grade {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}
</style> 