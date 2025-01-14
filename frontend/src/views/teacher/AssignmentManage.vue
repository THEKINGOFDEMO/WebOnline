<template>
  <div class="assignment-manage">
    <!-- 顶部过滤和搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="课程">
          <el-select v-model="filters.courseId" placeholder="选择课程" clearable>
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.title"
              :value="course._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable>
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已结束" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 作业列表 -->
    <el-table :data="assignments" style="width: 100%" v-loading="loading">
      <el-table-column prop="courseTitle" label="所属课程" />
      <el-table-column prop="title" label="作业标题" />
      <el-table-column prop="deadline" label="截止日期">
        <template #default="{ row }">
          {{ formatDate(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column prop="submitCount" label="提交情况" width="120">
        <template #default="{ row }">
          {{ row.submitCount }}/{{ row.totalCount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button 
            link 
            type="primary" 
            @click="handleViewSubmissions(row)"
          >
            查看提交
          </el-button>
          <el-button 
            v-if="row.status === 'draft'"
            link 
            type="success" 
            @click="handlePublish(row)"
          >
            发布
          </el-button>
          <el-button 
            v-if="row.status === 'published'"
            link 
            type="warning" 
            @click="handleUnpublish(row)"
          >
            下架
          </el-button>
          <el-button 
            link 
            type="danger" 
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="submissionTotal"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @update:current-page="val => currentPage = val"
        @update:page-size="val => pageSize = val"
      />
    </div>

    <!-- 提交记录对话框 -->
    <el-dialog
      v-model="submissionDialogVisible"
      title="作业批改"
      width="90%"
      :close-on-click-modal="false"
    >
      <!-- 统计信息 -->
      <div class="submission-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>总提交数</span>
                </div>
              </template>
              <div class="card-content">{{ submissionStats.total }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>已批改数</span>
                </div>
              </template>
              <div class="card-content">{{ submissionStats.graded }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>平均分</span>
                </div>
              </template>
              <div class="card-content">{{ submissionStats.averageScore.toFixed(1) }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>及格率</span>
                </div>
              </template>
              <div class="card-content">{{ submissionStats.passRate }}%</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 工具栏 -->
      <div class="submission-toolbar">
        <el-space>
          <el-button type="primary" @click="handleBatchGrade" :disabled="!selectedSubmissions.length">
            批量评分
          </el-button>
          <el-button type="success" @click="exportGradeList">
            导出成绩
          </el-button>
          <el-select v-model="gradeTemplate" placeholder="评语模板" clearable>
            <el-option
              v-for="item in gradeTemplates"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-space>
      </div>

      <el-table 
        :data="submissions" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="tableLoading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentEmail" label="学生邮箱" width="180" />
        <el-table-column prop="submitTime" label="提交时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="提交说明" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.content && row.content.length > 50"
              :content="row.content"
              placement="top"
            >
              <span>{{ row.content.slice(0, 50) }}...</span>
            </el-tooltip>
            <span v-else>{{ row.content || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="附件" width="200">
          <template #default="{ row }">
            <div v-if="row.attachments && row.attachments.length > 0">
              <div v-for="file in row.attachments" :key="file._id" class="file-item">
                <el-dropdown>
                  <el-button link type="primary">
                    {{ file.title }}
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="previewFile(file)">
                        <el-icon><View /></el-icon>预览
                      </el-dropdown-item>
                      <el-dropdown-item @click="downloadFile(file)">
                        <el-icon><Download /></el-icon>下载
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <span v-else>无附件</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSubmissionStatusType(row.status)">
              {{ getSubmissionStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="250">
          <template #default="{ row }">
            <template v-if="row.status === 'graded'">
              <div class="grade-info">
                <div class="score">得分：{{ row.score }}</div>
                <el-tooltip
                  v-if="row.comment"
                  :content="row.comment"
                  placement="top"
                >
                  <div class="comment text-ellipsis">
                    评语：{{ row.comment }}
                  </div>
                </el-tooltip>
                <el-button 
                  type="primary" 
                  link
                  @click="openGradeDialog(row)"
                >
                  修改评分
                </el-button>
              </div>
            </template>
            <el-button
              v-else
              type="primary"
              size="small"
              @click="openGradeDialog(row)"
            >
              评分
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="submissionTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @update:current-page="val => currentPage = val"
          @update:page-size="val => pageSize = val"
        />
      </div>
    </el-dialog>

    <!-- 批改作业弹窗 -->
    <el-dialog
      v-model="gradeDialog.visible"
      :title="gradeDialog.submission?.studentName + ' 的作业评分'"
      width="800px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="grade-dialog-content">
        <el-row :gutter="20">
          <!-- 左侧：学生信息和提交内容 -->
          <el-col :span="14">
            <div class="submission-preview">
              <div class="preview-header">
                <h4>提交内容</h4>
              </div>
              <div class="preview-content">
                <div class="info-item">
                  <label>提交时间：</label>
                  <span>{{ formatDate(gradeDialog.submission?.submitTime) }}</span>
                </div>
                <div class="info-item">
                  <label>提交说明：</label>
                  <div class="content-text">{{ gradeDialog.submission?.content || '无' }}</div>
                </div>
                <div class="info-item">
                  <label>附件：</label>
                  <div v-if="gradeDialog.submission?.attachments?.length" class="attachment-list">
                    <div v-for="file in gradeDialog.submission.attachments" :key="file._id" class="file-item">
                      <el-button type="primary" link @click="previewFile(file)">
                        <el-icon><View /></el-icon>
                        {{ file.title }}
                      </el-button>
                    </div>
                  </div>
                  <span v-else>无附件</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <!-- 右侧：评分表单 -->
          <el-col :span="10">
            <el-form 
              ref="gradeFormRef"
              :model="gradeDialog.form"
              :rules="gradeDialog.rules"
              label-width="80px"
            >
              <el-form-item label="得分" prop="score" required>
                <el-input-number 
                  v-model="gradeDialog.form.score" 
                  :min="0" 
                  :max="currentAssignment?.totalScore || 100"
                  :precision="1"
                  :step="0.5"
                  style="width: 150px"
                />
                <span class="total-score">/ {{ currentAssignment?.totalScore || 100 }}</span>
              </el-form-item>
              <el-form-item label="评语" prop="comment">
                <el-select 
                  v-if="gradeTemplates.length" 
                  v-model="selectedTemplate"
                  placeholder="选择评语模板"
                  clearable
                  class="mb-2 w-full"
                  @change="handleTemplateChange"
                >
                  <el-option
                    v-for="item in gradeTemplates"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-input 
                  v-model="gradeDialog.form.comment"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入评语"
                />
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="gradeDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="gradeDialog.loading" @click="handleGrade">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量评分弹窗 -->
    <el-dialog
      v-model="batchGradeDialog.visible"
      title="批量评分"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="batchGradeFormRef"
        :model="batchGradeDialog.form"
        :rules="batchGradeDialog.rules"
        label-width="80px"
      >
        <el-form-item label="得分" prop="score" required>
          <el-input-number 
            v-model="batchGradeDialog.form.score" 
            :min="0" 
            :max="currentAssignment?.totalScore || 100"
            :precision="1"
            :step="0.5"
          />
        </el-form-item>
        <el-form-item label="评语" prop="comment">
          <el-select 
            v-if="gradeTemplates.length" 
            v-model="selectedTemplate"
            placeholder="选择评语模板"
            clearable
            class="mb-2 w-full"
            @change="handleTemplateChange"
          >
            <el-option
              v-for="item in gradeTemplates"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input 
            v-model="batchGradeDialog.form.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入评语"
          />
        </el-form-item>
      </el-form>
      <div class="batch-info">
        <el-alert
          title="批量评分提示"
          type="warning"
          :closable="false"
          show-icon
        >
          <p>已选择 {{ selectedSubmissions.length }} 份作业进行批量评分</p>
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="batchGradeDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="batchGradeDialog.loading" @click="handleBatchGradeSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 文件预览弹窗 -->
    <el-dialog
      v-model="previewDialog.visible"
      :title="previewDialog.title"
      width="80%"
      fullscreen
      append-to-body
      destroy-on-close
    >
      <div class="preview-container">
        <iframe
          v-if="previewDialog.url"
          :src="previewDialog.url"
          frameborder="0"
          class="preview-iframe"
        ></iframe>
        <div v-else class="preview-error">
          该文件类型不支持预览，请下载后查看
        </div>
      </div>
    </el-dialog>

    <!-- 作业表单弹窗 -->
    <el-dialog
      v-model="assignmentDialog.visible"
      :title="assignmentDialog.isEdit ? '编辑作业' : '创建作业'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="assignmentFormRef"
        :model="assignmentDialog.form"
        :rules="assignmentDialog.rules"
        label-width="100px"
      >
        <el-form-item label="所属课程" prop="courseId" v-if="!assignmentDialog.isEdit">
          <el-select v-model="assignmentDialog.form.courseId" placeholder="选择课程">
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.title"
              :value="course._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作业标题" prop="title">
          <el-input v-model="assignmentDialog.form.title" />
        </el-form-item>
        <el-form-item label="作业描述" prop="description">
          <el-input
            v-model="assignmentDialog.form.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="assignmentDialog.form.deadline"
            type="datetime"
            placeholder="选择截止日期"
          />
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input-number 
            v-model="assignmentDialog.form.totalScore" 
            :min="0" 
            :max="100"
            :precision="1"
          />
        </el-form-item>
        <el-form-item label="最大提交次数" prop="maxAttempts">
          <el-input-number 
            v-model="assignmentDialog.form.maxAttempts" 
            :min="1" 
            :max="10"
            :precision="0"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            :http-request="uploadAttachment"
            :before-upload="beforeAttachmentUpload"
            multiple
          >
            <el-button type="primary">上传附件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持任意类型文件，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignmentDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="assignmentDialog.loading" @click="handleAssignmentSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAssignmentList, 
  updateAssignmentStatus, 
  deleteAssignment, 
  getSubmissions, 
  gradeSubmission 
} from '@/api/assignment'
import { getCourses } from '@/api/course'
import { ArrowDown, View, Download } from '@element-plus/icons-vue'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export default {
  name: 'AssignmentManage',
  components: {
    ArrowDown,
    View,
    Download
  },
  setup() {
    // 作业列表相关的状态
    const loading = ref(false)
    const courses = ref([])
    const assignments = ref([])
    const total = ref(0)
    const page = ref(1)
    const limit = ref(10)

    // 过滤条件
    const filters = reactive({
      courseId: '',
      status: '',
      dateRange: []
    })

    // 提交情况弹窗
    const submissionsDialog = reactive({
      visible: false,
      loading: false,
      list: [],
      assignmentId: '',
      stats: {
        total: 0,
        submitted: 0,
        graded: 0,
        averageScore: 0
      }
    })

    // 批改作业弹窗
    const gradeDialog = reactive({
      visible: false,
      loading: false,
      submission: null,
      form: {
        score: 0,
        comment: ''
      },
      rules: {
        score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
        comment: [{ required: true, message: '请输入评语', trigger: 'blur' }]
      }
    })

    // 作业表单弹窗
    const assignmentDialog = reactive({
      visible: false,
      loading: false,
      isEdit: false,
      form: {
        courseId: '',
        title: '',
        description: '',
        deadline: '',
        totalScore: 100,
        maxAttempts: 1
      },
      rules: {
        courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
        deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
        totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }],
        maxAttempts: [{ required: true, message: '请输入最大提交次数', trigger: 'blur' }]
      }
    })

    // 提交记录相关的状态
    const submissionDialogVisible = ref(false)
    const submissions = ref([])
    const submissionTotal = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const currentAssignment = ref(null)
    const gradeTemplate = ref('')

    // 新增状态
    const selectedSubmissions = ref([])
    const submissionStats = ref({
      total: 0,
      graded: 0,
      averageScore: 0,
      passRate: 0
    })
    const tableLoading = ref(false)
    const selectedTemplate = ref('')
    const gradeTemplates = ref([
      { label: '很好，继续保持', value: '作业完成得很好，思路清晰，继续保持！' },
      { label: '基本合格，需改进', value: '作业基本完成，但还有一些需要改进的地方：\n1. 请注意细节处理\n2. 建议多添加注释说明' },
      { label: '需要补充完善', value: '作业内容不够完整，请根据以下意见进行修改：\n1. 补充必要的实现细节\n2. 完善文档说明' }
    ])

    // 批量评分弹窗
    const batchGradeDialog = reactive({
      visible: false,
      loading: false,
      form: {
        score: 0,
        comment: ''
      },
      rules: {
        score: [
          { required: true, message: '请输入分数', trigger: 'blur' }
        ]
      }
    })

    // 文件预览弹窗
    const previewDialog = reactive({
      visible: false,
      title: '',
      url: ''
    })

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未设置'
      const d = new Date(date)
      if (isNaN(d.getTime())) return '无效日期'
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        published: 'success',
        draft: 'info',
        closed: 'danger'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        published: '已发布',
        draft: '草稿',
        closed: '已结束'
      }
      return texts[status] || status
    }

    // 获取课程列表
    const fetchCourses = async () => {
      try {
        console.log('开始获取课程列表...')
        const res = await getCourses({ role: 'teacher' })
        console.log('课程列表API响应:', res)
        if (res.success) {
          courses.value = res.courses || []
          console.log('成功获取课程列表，数量:', courses.value.length)
          if (courses.value.length === 0) {
            ElMessage.warning('暂无可管理的课程')
          }
        } else {
          console.error('获取课程列表失败:', res.message)
          ElMessage.error(res.message || '获取课程列表失败')
        }
      } catch (error) {
        console.error('获取课程列表错误:', error)
        if (error.response) {
          console.error('错误响应:', error.response.data)
        }
        ElMessage.error('获取课程列表失败')
      }
    }

    // 获取作业列表
    const fetchAssignments = async () => {
      loading.value = true
      try {
        const params = {
          page: page.value,
          limit: limit.value
        }

        console.log('构建请求参数...')
        console.log('当前过滤条件:', filters)
        
        // 只有在courseId不为空字符串时才添加到参数中
        if (filters.courseId && filters.courseId.trim() !== '') {
          console.log('添加课程ID过滤:', filters.courseId)
          // 验证courseId是否为有效的MongoDB ObjectId格式
          if (!/^[0-9a-fA-F]{24}$/.test(filters.courseId)) {
            console.error('无效的课程ID格式:', filters.courseId)
            ElMessage.error('无效的课程ID格式')
            return
          }
          params.courseId = filters.courseId
        }

        // 只有在status不为空字符串时才添加到参数中
        if (filters.status && filters.status.trim() !== '') {
          console.log('添加状态过滤:', filters.status)
          // 验证status是否为有效值
          if (!['published', 'draft', 'closed'].includes(filters.status)) {
            console.error('无效的状态值:', filters.status)
            ElMessage.error('无效的状态值')
            return
          }
          params.status = filters.status
        }

        // 只有在选择了日期范围时才添加日期参数
        if (filters.dateRange && filters.dateRange.length === 2) {
          console.log('添加日期范围过滤:', filters.dateRange)
          params.startDate = filters.dateRange[0]
          params.endDate = filters.dateRange[1]
        }
        
        console.log('最终请求参数:', params)
        const res = await getAssignmentList(params)
        console.log('API响应:', res)
        
        if (res.success) {
          assignments.value = res.assignments
          total.value = res.total
          console.log('成功获取作业列表，数量:', assignments.value.length)
        } else {
          console.error('获取作业列表失败:', res.message)
          ElMessage.error(res.message || '获取作业列表失败')
        }
      } catch (error) {
        console.error('获取作业列表错误:', error)
        if (error.response) {
          console.error('错误响应:', error.response.data)
        }
        ElMessage.error(error.message || '获取作业列表失败')
      } finally {
        loading.value = false
      }
    }

    // 处理过滤
    const handleFilter = () => {
      page.value = 1
      fetchAssignments()
    }

    // 重置过滤
    const resetFilter = () => {
      filters.courseId = ''
      filters.status = ''
      filters.dateRange = []
      page.value = 1
      fetchAssignments()
    }

    // 处理发布作业
    const handlePublish = async (row) => {
      try {
        await ElMessageBox.confirm('确定要发布该作业吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const res = await updateAssignmentStatus(row._id, 'published')
        if (res.success) {
          ElMessage.success('作业发布成功')
          fetchAssignments()
        } else {
          ElMessage.error(res.message || '作业发布失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('发布作业错误:', error)
          ElMessage.error('作业发布失败')
        }
      }
    }

    // 处理下架作业
    const handleUnpublish = async (row) => {
      try {
        await ElMessageBox.confirm('确定要下架该作业吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const res = await updateAssignmentStatus(row._id, 'draft')
        if (res.success) {
          ElMessage.success('作业下架成功')
          fetchAssignments()
        } else {
          ElMessage.error(res.message || '作业下架失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('下架作业错误:', error)
          ElMessage.error('作业下架失败')
        }
      }
    }

    // 处理删除作业
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除该作业吗？此操作不可恢复！', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })
        
        const res = await deleteAssignment(row._id)
        if (res.success) {
          ElMessage.success('作业删除成功')
          fetchAssignments()
        } else {
          ElMessage.error(res.message || '作业删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除作业错误:', error)
          ElMessage.error('作业删除失败')
        }
      }
    }

    // 处理查看提交
    const handleViewSubmissions = async (row) => {
      try {
        // 先重置所有状态
        submissions.value = []
        selectedSubmissions.value = []
        submissionStats.value = {
          total: 0,
          graded: 0,
          averageScore: 0,
          passRate: 0
        }
        
        // 设置当前作业和显示对话框
        currentAssignment.value = row
        currentPage.value = 1
        pageSize.value = 10
        submissionDialogVisible.value = true
        
        // 延迟加载数据
        await nextTick()
        tableLoading.value = true
        
        const res = await getSubmissions(currentAssignment.value._id, {
          page: currentPage.value,
          limit: pageSize.value
        })
        
        if (res.success) {
          submissionTotal.value = res.data.total
          submissions.value = res.data.submissions
          
          // 更新统计信息
          updateStats()
        }
      } catch (error) {
        ElMessage.error(error.message || '获取提交记录失败')
      } finally {
        tableLoading.value = false
      }
    }

    // 更新统计信息
    const updateStats = () => {
      if (!submissions.value || !currentAssignment.value) return

      const gradedSubmissions = submissions.value.filter(s => s.status === 'graded')
      const total = submissions.value.length
      const graded = gradedSubmissions.length
      
      let averageScore = 0
      if (graded > 0) {
        const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0)
        averageScore = totalScore / graded
      }

      let passRate = 0
      if (graded > 0) {
        const passScore = (currentAssignment.value.totalScore || 100) * 0.6
        const passed = gradedSubmissions.filter(s => (s.score || 0) >= passScore).length
        passRate = (passed / graded * 100).toFixed(1)
      }

      submissionStats.value = {
        total,
        graded,
        averageScore,
        passRate
      }
    }

    // 处理页码变化
    const handleCurrentChange = async (newPage) => {
      if (!currentAssignment.value) return
      
      try {
        tableLoading.value = true
        const res = await getSubmissions(currentAssignment.value._id, {
          page: newPage,
          limit: pageSize.value
        })
        
        if (res.success) {
          submissions.value = res.data.submissions
          submissionTotal.value = res.data.total
          updateStats()
        }
      } catch (error) {
        ElMessage.error(error.message || '获取提交记录失败')
      } finally {
        tableLoading.value = false
      }
    }

    // 处理每页数量变化
    const handleSizeChange = async (newSize) => {
      if (!currentAssignment.value) return
      
      try {
        tableLoading.value = true
        currentPage.value = 1
        const res = await getSubmissions(currentAssignment.value._id, {
          page: 1,
          limit: newSize
        })
        
        if (res.success) {
          submissions.value = res.data.submissions
          submissionTotal.value = res.data.total
          updateStats()
        }
      } catch (error) {
        ElMessage.error(error.message || '获取提交记录失败')
      } finally {
        tableLoading.value = false
      }
    }

    // 获取提交状态类型
    const getSubmissionStatusType = (status) => {
      const types = {
        submitted: 'warning',
        graded: 'success',
        not_submitted: 'info'
      }
      return types[status] || 'info'
    }

    // 获取提交状态文本
    const getSubmissionStatusText = (status) => {
      const texts = {
        submitted: '已提交',
        graded: '已批改',
        not_submitted: '未提交'
      }
      return texts[status] || status
    }

    // 处理文件预览
    const previewFile = (file) => {
      // 根据文件类型处理预览
      const fileType = file.title.split('.').pop().toLowerCase()
      if (['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'].includes(fileType)) {
        previewDialog.title = file.title
        previewDialog.url = file.url
        previewDialog.visible = true
      } else {
        ElMessage.warning('该文件类型不支持预览，请下载后查看')
      }
    }

    // 处理文件下载
    const downloadFile = (file) => {
      saveAs(file.url, file.title)
    }

    // 表格选择变化
    const handleSelectionChange = (val) => {
      selectedSubmissions.value = val
    }

    // 处理评语模板变化
    const handleTemplateChange = (value) => {
      if (value) {
        if (gradeDialog.visible) {
          gradeDialog.form.comment = value
        } else if (batchGradeDialog.visible) {
          batchGradeDialog.form.comment = value
        }
      }
    }

    // 处理批量评分
    const handleBatchGrade = () => {
      if (selectedSubmissions.value.length === 0) {
        ElMessage.warning('请先选择要批改的作业')
        return
      }
      batchGradeDialog.form.score = 0
      batchGradeDialog.form.comment = ''
      batchGradeDialog.visible = true
    }

    // 提交批量评分
    const handleBatchGradeSubmit = async () => {
      try {
        batchGradeDialog.loading = true
        const promises = selectedSubmissions.value.map(submission => 
          gradeSubmission(currentAssignment.value._id, submission._id, {
            score: batchGradeDialog.form.score,
            comment: batchGradeDialog.form.comment
          })
        )
        await Promise.all(promises)
        ElMessage.success('批量评分成功')
        batchGradeDialog.visible = false
        
        // 重新获取提交记录
        await handleViewSubmissions(currentAssignment.value)
      } catch (error) {
        console.error('批量评分错误:', error)
        ElMessage.error('批量评分失败')
      } finally {
        batchGradeDialog.loading = false
      }
    }

    // 导出成绩
    const exportGradeList = () => {
      const data = submissions.value.map(item => ({
        '学生姓名': item.studentName,
        '学生邮箱': item.studentEmail,
        '提交时间': formatDate(item.submitTime),
        '状态': getSubmissionStatusText(item.status),
        '得分': item.score || '',
        '评语': item.comment || ''
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '成绩单')
      XLSX.writeFile(wb, `${currentAssignment.value?.title || '作业'}-成绩单.xlsx`)
    }

    // 添加批改作业的函数
    const handleGrade = async () => {
      if (!gradeDialog.form.score || !gradeDialog.form.comment) {
        ElMessage.warning('请填写完整的评分信息')
        return
      }

      gradeDialog.loading = true
      try {
        console.log('提交评分，作业ID:', currentAssignment.value._id)
        console.log('提交记录:', gradeDialog.submission)
        
        const res = await gradeSubmission(
          currentAssignment.value._id,
          gradeDialog.submission._id,  // 使用提交记录的 ID
          gradeDialog.form
        )
        
        if (res.success) {
          ElMessage.success('批改成功')
          gradeDialog.visible = false
          // 重新获取提交记录
          await handleViewSubmissions(currentAssignment.value)
        } else {
          ElMessage.error(res.message || '批改失败')
        }
      } catch (error) {
        console.error('批改作业错误:', error)
        ElMessage.error('批改失败')
      } finally {
        gradeDialog.loading = false
      }
    }

    // 添加打开批改对话框的函数
    const openGradeDialog = (submission) => {
      console.log('打开批改对话框，提交记录:', submission)
      gradeDialog.submission = submission
      gradeDialog.form.score = submission.score || 0
      gradeDialog.form.comment = submission.comment || ''
      gradeDialog.visible = true
    }

    // 清理对话框状态
    const cleanupDialogState = () => {
      submissions.value = []
      selectedSubmissions.value = []
      currentAssignment.value = null
      submissionStats.value = {
        total: 0,
        graded: 0,
        averageScore: 0,
        passRate: 0
      }
      gradeTemplate.value = ''
      selectedTemplate.value = ''
    }

    // 监听对话框关闭
    watch(submissionDialogVisible, (newVal) => {
      if (!newVal) {
        cleanupDialogState()
      }
    })

    onMounted(() => {
      fetchCourses()
      fetchAssignments()
    })

    return {
      loading,
      courses,
      assignments,
      total,
      page,
      limit,
      filters,
      submissionsDialog,
      gradeDialog,
      assignmentDialog,
      handleFilter,
      resetFilter,
      fetchAssignments,
      formatDate,
      getStatusType,
      getStatusText,
      handlePublish,
      handleUnpublish,
      handleDelete,
      handleViewSubmissions,
      handleGrade,
      openGradeDialog,
      handleCurrentChange,
      handleSizeChange,
      submissionDialogVisible,
      submissions,
      submissionTotal,
      currentPage,
      pageSize,
      currentAssignment,
      getSubmissionStatusType,
      getSubmissionStatusText,
      selectedSubmissions,
      submissionStats,
      tableLoading,
      gradeTemplates,
      selectedTemplate,
      batchGradeDialog,
      previewDialog,
      handleSelectionChange,
      handleTemplateChange,
      handleBatchGrade,
      handleBatchGradeSubmit,
      previewFile,
      downloadFile,
      exportGradeList,
      gradeTemplate
    }
  }
}
</script>

<style scoped>
.assignment-manage {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.file-item {
  margin-bottom: 5px;
}

.file-item:last-child {
  margin-bottom: 0;
}

.stats-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.el-statistic) {
  --el-statistic-content-font-size: 24px;
  --el-statistic-title-font-size: 14px;
  --el-statistic-title-color: var(--el-text-color-secondary);
}

:deep(.el-pagination) {
  --el-pagination-button-disabled-bg-color: var(--el-disabled-bg-color);
  --el-pagination-button-disabled-color: var(--el-text-color-placeholder);
  --el-pagination-hover-color: var(--el-color-primary);
  --el-pagination-font-size: 14px;
}

:deep(.el-pagination .el-select .el-input) {
  width: 110px;
}

:deep(.el-pagination__total) {
  margin-right: 16px;
}

:deep(.el-pagination__sizes) {
  margin-right: 16px;
}

.submission-stats {
  margin-bottom: 20px;
}

.card-header {
  font-size: 14px;
  color: #606266;
}

.card-content {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  text-align: center;
}

.submission-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grade-info .score {
  font-weight: bold;
  margin-bottom: 4px;
}

.grade-info .comment {
  color: #606266;
  margin-bottom: 4px;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grade-dialog-content {
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.submission-preview {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
}

.submission-preview .preview-header {
  margin-bottom: 15px;
}

.submission-preview .preview-header h4 {
  margin: 0;
  color: #303133;
}

.submission-preview .info-item {
  margin-bottom: 15px;
}

.submission-preview .info-item label {
  color: #606266;
  margin-right: 8px;
}

.submission-preview .info-item .content-text {
  margin-top: 8px;
  white-space: pre-wrap;
}

.total-score {
  margin-left: 8px;
  color: #909399;
}

.preview-container {
  height: calc(100vh - 200px);
}

.preview-container .preview-iframe {
  width: 100%;
  height: 100%;
}

.preview-container .preview-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.batch-info {
  margin-top: 20px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style> 