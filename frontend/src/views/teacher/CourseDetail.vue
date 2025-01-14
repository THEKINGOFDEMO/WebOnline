<template>
  <div class="course-detail">
    <!-- 课程基本信息 -->
    <div class="course-info">
      <div class="cover-container">
        <img :src="course.coverImage" :alt="course.title" class="cover-image">
      </div>
      <div class="info-content">
        <h2>{{ course.title }}</h2>
        <div class="info-items">
          <span class="info-item">
            <el-tag>{{ course.category }}</el-tag>
          </span>
          <span class="info-item">
            <el-tag :type="levelType">{{ course.level }}</el-tag>
          </span>
          <span class="info-item">
            <el-icon><User /></el-icon>
            {{ course.studentCount || 0 }} 名学生
          </span>
          <span class="info-item">
            <el-tag :type="course.status === 'published' ? 'success' : 'info'">
              {{ course.status === 'published' ? '已发布' : '未发布' }}
            </el-tag>
          </span>
        </div>
        <p class="description">{{ course.description }}</p>
      </div>
    </div>

    <!-- 功能标签页 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 章节管理标签页 -->
      <el-tab-pane label="章节管理" name="chapters">
        <div class="tab-header">
          <el-button type="primary" @click="handleAddChapter">
            添加章节
          </el-button>
        </div>
        <el-table 
          :data="chapters" 
          style="width: 100%"
          :resize-observer="{ disconnect: true }"
        >
          <el-table-column prop="title" label="章节标题" />
          <el-table-column prop="description" label="章节描述" show-overflow-tooltip />
          <el-table-column prop="duration" label="时长" width="100">
            <template #default="{ row }">
              {{ row.duration }}分钟
            </template>
          </el-table-column>
          <el-table-column label="资源" width="120">
            <template #default="{ row }">
              <el-button v-if="row.resources?.length" link type="primary" @click="handleViewResources(row)">
                查看资源
              </el-button>
              <span v-else>无资源</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEditChapter(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteChapter(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 作业管理标签页 -->
      <el-tab-pane label="作业管理" name="assignments">
        <div class="tab-header">
          <el-button type="primary" @click="handleAddAssignment">
            添加作业
          </el-button>
        </div>
        <el-table :data="assignments" style="width: 100%" v-loading="loading">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column prop="deadline" label="截止日期">
            <template #default="{ row }">
              {{ formatDate(row.deadline) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalScore" label="总分" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goToAssignmentDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 作业表单对话框 -->
        <el-dialog
          :title="'添加作业'"
          v-model="assignmentDialog.visible"
          width="600px"
        >
          <el-form
            ref="assignmentFormRef"
            :model="assignmentDialog.form"
            :rules="assignmentDialog.rules"
            label-width="100px"
          >
            <el-form-item label="标题" prop="title">
              <el-input v-model="assignmentDialog.form.title" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
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
              />
            </el-form-item>
            <el-form-item label="附件">
              <el-upload
                action="#"
                :http-request="uploadAttachment"
                :before-upload="beforeAttachmentUpload"
                multiple
              >
                <el-button type="primary">上传附件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    文件大小不超过10MB
                  </div>
                </template>
              </el-upload>
              <div v-if="assignmentDialog.form.attachments.length > 0">
                <div
                  v-for="(file, index) in assignmentDialog.form.attachments"
                  :key="index"
                  class="mt-2"
                >
                  {{ file.name }}
                  <el-button
                    link
                    type="danger"
                    @click="assignmentDialog.form.attachments.splice(index, 1)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="assignmentDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="handleAssignmentSubmit">
              确定
            </el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 学生管理标签页 -->
      <el-tab-pane label="学生管理" name="students">
        <el-table 
          :data="students" 
          style="width: 100%"
          v-loading="studentsLoading"
        >
          <el-table-column prop="studentName" label="姓名" width="120">
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
                @click="handleViewStudentDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 学习详情弹窗 -->
        <el-dialog
          v-model="studentDetailDialog.visible"
          title="学习详情"
          width="800px"
          destroy-on-close
        >
          <div v-loading="studentDetailDialog.loading">
            <!-- 基本信息 -->
            <div class="student-detail-header">
              <el-avatar 
                :size="64" 
                :src="studentDetailDialog.data.studentAvatar"
              />
              <div class="student-detail-info">
                <h3>{{ studentDetailDialog.data.studentName }}</h3>
                <p>选课时间：{{ formatDate(studentDetailDialog.data.enrollTime) }}</p>
                <p>学习进度：{{ studentDetailDialog.data.progress }}%</p>
                <p>最近学习：{{ formatDate(studentDetailDialog.data.lastStudyTime) }}</p>
              </div>
            </div>

            <!-- 章节学习情况 -->
            <div class="detail-section">
              <h4>章节学习情况</h4>
              <el-table :data="studentDetailDialog.chapters" style="width: 100%">
                <el-table-column prop="title" label="章节名称" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getChapterStatusType(row.status)">
                      {{ getChapterStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="progress" label="进度" width="180">
                  <template #default="{ row }">
                    <el-progress :percentage="row.progress || 0" />
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
              <el-table :data="studentDetailDialog.assignments" style="width: 100%">
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
      </el-tab-pane>
    </el-tabs>

    <!-- 章节对话框 -->
    <el-dialog
      v-model="chapterDialog.visible"
      :title="chapterDialog.isEdit ? '编辑章节' : '添加章节'"
      width="600px"
    >
      <el-form
        ref="chapterFormRef"
        :model="chapterDialog.form"
        :rules="chapterDialog.rules"
        label-width="100px"
      >
        <el-form-item label="章节标题" prop="title">
          <el-input v-model="chapterDialog.form.title" />
        </el-form-item>
        <el-form-item label="章节描述" prop="description">
          <el-input
            v-model="chapterDialog.form.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="章节内容" prop="content">
          <el-input
            v-model="chapterDialog.form.content"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="时长(分钟)" prop="duration">
          <el-input-number v-model="chapterDialog.form.duration" :min="1" />
        </el-form-item>
        <el-form-item label="学习资源">
          <el-upload
            :http-request="uploadResource"
            :before-upload="beforeResourceUpload"
            multiple
          >
            <el-button type="primary">上传资源</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleChapterSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { convertResourceUrls } from '@/utils/url'
import { 
  getCourseDetail,
} from '@/api/course'
import {
  getCourseChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  uploadChapterResource
} from '@/api/chapter'
import {
  getCourseAssignments,
  createAssignment
} from '@/api/assignment'
import {
  getCourseStudents,
  getEnrollmentDetail
} from '@/api/enrollment'

export default {
  name: 'CourseDetail',
  components: {
    User
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = route.params.id
    const loading = ref(false)
    const activeTab = ref('chapters')
    const chapterFormRef = ref(null)
    const assignmentFormRef = ref(null)

    // 课程信息
    const course = reactive({
      title: '',
      category: '',
      level: '',
      description: '',
      coverImage: '',
      studentCount: 0,
      status: ''
    })

    // 计算难度等级对应的标签类型
    const levelType = computed(() => {
      const types = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'danger'
      }
      return types[course.level] || 'info'
    })

    // 章节相关
    const chapters = ref([])
    const chapterDialog = reactive({
      visible: false,
      isEdit: false,
      form: {
        title: '',
        description: '',
        content: '',
        duration: 30,
        resources: []
      },
      rules: {
        title: [
          { required: true, message: '请输入章节标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入章节描述', trigger: 'blur' },
          { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入章节内容', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入章节时长', trigger: 'blur' }
        ]
      }
    })

    // 作业相关
    const assignments = ref([])
    const assignmentDialog = reactive({
      visible: false,
      isEdit: false,
      form: {
        title: '',
        description: '',
        deadline: '',
        totalScore: 100,
        attachments: []
      },
      rules: {
        title: [
          { required: true, message: '请输入作业标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入作业描述', trigger: 'blur' },
          { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
        ],
        deadline: [
          { required: true, message: '请选择截止日期', trigger: 'change' }
        ],
        totalScore: [
          { required: true, message: '请输入总分', trigger: 'blur' }
        ]
      }
    })

    // 学生列表数据
    const students = ref([])
    const studentsLoading = ref(false)

    // 获取学生列表
    const fetchStudents = async () => {
      try {
        studentsLoading.value = true
        const res = await getCourseStudents(route.params.id)
        if (res.success) {
          students.value = res.students
        } else {
          ElMessage.error(res.message || '获取学生列表失败')
        }
      } catch (error) {
        console.error('获取学生列表错误:', error)
        ElMessage.error('获取学生列表失败')
      } finally {
        studentsLoading.value = false
      }
    }

    // 学生详情弹窗数据
    const studentDetailDialog = reactive({
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
    });

    // 获取课程详情
    const fetchCourseDetail = async () => {
      try {
        loading.value = true
        const res = await getCourseDetail(courseId)
        // 转换资源URL
        const courseData = convertResourceUrls(res.course, ['coverImage', 'avatar'])
        Object.assign(course, courseData)
      } catch (error) {
        console.error('Fetch course detail error:', error)
        ElMessage.error('获取课程信息失败')
      } finally {
        loading.value = false
      }
    }

    // 获取章节列表
    const fetchChapters = async () => {
      try {
        const res = await getCourseChapters(courseId)
        chapters.value = res.chapters
      } catch (error) {
        console.error('Fetch chapters error:', error)
        ElMessage.error('获取章节列表失败')
      }
    }

    // 获取作业列表
    const fetchAssignments = async () => {
      try {
        const res = await getCourseAssignments(route.params.id)
        assignments.value = res.assignments
      } catch (error) {
        console.error('获取作业列表失败:', error)
        ElMessage.error('获取作业列表失败')
      }
    }

    // 日期格式化
    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    // 章节相关方法
    const handleAddChapter = () => {
      chapterDialog.isEdit = false
      chapterDialog.form = {
        title: '',
        description: '',
        content: '',
        duration: 30,
        resources: []
      }
      chapterDialog.visible = true
    }

    const handleEditChapter = (chapter) => {
      chapterDialog.isEdit = true
      chapterDialog.form = { 
        ...chapter,
        id: chapter._id  // 确保id字段存在
      }
      chapterDialog.visible = true
    }

    const handleDeleteChapter = async (chapter) => {
      try {
        await ElMessageBox.confirm('确定要删除该章节吗？')
        await deleteChapter(chapter._id)
        ElMessage.success('删除成功')
        fetchChapters()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete chapter error:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    const handleChapterSubmit = async () => {
      try {
        await chapterFormRef.value.validate()
        let chapterId
        
        // 创建或更新章节
        if (chapterDialog.isEdit) {
          await updateChapter(chapterDialog.form.id || chapterDialog.form._id, {
            title: chapterDialog.form.title,
            description: chapterDialog.form.description,
            content: chapterDialog.form.content,
            duration: chapterDialog.form.duration
          })
          chapterId = chapterDialog.form.id || chapterDialog.form._id
          ElMessage.success('更新成功')
        } else {
          const res = await createChapter(courseId, {
            title: chapterDialog.form.title,
            description: chapterDialog.form.description,
            content: chapterDialog.form.content,
            duration: chapterDialog.form.duration
          })
          chapterId = res.data._id  // 使用_id
          ElMessage.success('创建成功')
          
          // 上传待上传的资源
          const pendingResources = chapterDialog.form.resources.filter(r => r.status === 'pending')
          for (const resource of pendingResources) {
            const formData = new FormData()
            formData.append('resource', resource.file)
            try {
              await uploadChapterResource(chapterId, formData)
            } catch (error) {
              console.error('Upload resource error:', error)
              ElMessage.warning(`资源 ${resource.name} 上传失败`)
            }
          }
        }
        
        chapterDialog.visible = false
        fetchChapters()
      } catch (error) {
        console.error('Submit chapter error:', error)
        ElMessage.error(chapterDialog.isEdit ? '更新失败' : '创建失败')
      }
    }

    // 作业相关方法
    const handleAddAssignment = () => {
      assignmentDialog.isEdit = false
      assignmentDialog.form = {
        title: '',
        description: '',
        deadline: '',
        totalScore: 100,
        attachments: []
      }
      assignmentDialog.visible = true
    }

    const goToAssignmentDetail = (assignment) => {
      router.push({
        name: 'AssignmentManage',
        query: { 
          assignmentId: assignment._id,
          courseId: route.params.id
        }
      })
    }

    // 资源上传相关方法
    const beforeResourceUpload = (file) => {
      const isLt20M = file.size / 1024 / 1024 < 20
      if (!isLt20M) {
        ElMessage.error('资源文件大小不能超过 20MB!')
        return false
      }
      return true
    }

    const uploadResource = async (options) => {
      try {
        if (chapterDialog.isEdit) {
          // 如果是编辑模式，直接上传到服务器
          const formData = new FormData()
          formData.append('resource', options.file)
          const res = await uploadChapterResource(chapterDialog.form.id, formData)
          chapterDialog.form.resources.push(res.data)
          ElMessage.success('资源上传成功')
        } else {
          // 如果是新建模式，先将文件保存在表单中
          chapterDialog.form.resources.push({
            name: options.file.name,
            file: options.file,
            status: 'pending'  // 标记为待上传
          })
          ElMessage.success('资源已添加，将在保存章节时上传')
        }
      } catch (error) {
        console.error('Upload resource error:', error)
        ElMessage.error('资源上传失败')
      }
    }

    // 附件上传相关方法
    const beforeAttachmentUpload = (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        ElMessage.error('附件大小不能超过 10MB!')
        return false
      }
      return true
    }

    const uploadAttachment = async (options) => {
      try {
        // 新建模式下，先将文件保存在表单中
        assignmentDialog.form.attachments.push({
          name: options.file.name,
          file: options.file,
          status: 'pending'  // 标记为待上传
        })
        ElMessage.success('附件已添加，将在保存作业时上传')
      } catch (error) {
        console.error('Upload attachment error:', error)
        ElMessage.error('附件上传失败')
      }
    }

    // 查看学生详情
    const handleViewStudentDetail = async (row) => {
      try {
        studentDetailDialog.visible = true;
        studentDetailDialog.loading = true;
        
        // 初始化基本数据
        studentDetailDialog.data = {
          studentName: row.studentName,
          studentAvatar: row.studentAvatar,
          studentEmail: '',
          enrollTime: row.enrollTime,
          progress: row.progress,
          lastStudyTime: row.lastStudyTime,
          status: ''
        };
        studentDetailDialog.chapters = [];
        studentDetailDialog.assignments = [];
        
        // 获取详细数据
        const res = await getEnrollmentDetail(row.enrollmentId);
        if (res.success) {
          studentDetailDialog.data = res.data;
          studentDetailDialog.chapters = res.data.chapters;
          studentDetailDialog.assignments = res.data.assignments;
        } else {
          ElMessage.error(res.message || '获取学习详情失败');
        }
      } catch (error) {
        console.error('获取学习详情错误:', error);
        ElMessage.error('获取学习详情失败');
      } finally {
        studentDetailDialog.loading = false;
      }
    };

    // 作业状态显示
    const getStatusType = (status) => {
      switch (status) {
        case 'active':
          return 'success'
        case 'draft':
          return 'info'
        case 'ended':
          return 'warning'
        default:
          return 'info'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'active':
          return '进行中'
        case 'draft':
          return '草稿'
        case 'ended':
          return '已结束'
        default:
          return '未知'
      }
    }

    // 作业提交
    const handleAssignmentSubmit = async () => {
      try {
        await assignmentFormRef.value.validate()
        
        // 创建作业
        await createAssignment(route.params.id, {
          title: assignmentDialog.form.title,
          description: assignmentDialog.form.description,
          deadline: assignmentDialog.form.deadline,
          totalScore: assignmentDialog.form.totalScore
        })

        ElMessage.success('创建成功')
        assignmentDialog.visible = false
        fetchAssignments()
      } catch (error) {
        console.error('Submit assignment error:', error)
        ElMessage.error('创建失败')
      }
    }

    // 获取作业提交状态样式
    const getSubmissionStatusType = (submission) => {
      if (!submission.submitTime) return 'info'
      if (!submission.graded) return 'warning'
      return 'success'
    }

    // 获取作业提交状态文本
    const getSubmissionStatusText = (submission) => {
      if (!submission.submitTime) return '未提交'
      if (!submission.graded) return '待批改'
      return '已完成'
    }

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

    // 监听标签页切换
    watch(activeTab, (newTab) => {
      if (newTab === 'students') {
        fetchStudents()
      }
    })

    onMounted(() => {
      fetchCourseDetail()
      fetchChapters()
      fetchAssignments()
      if (activeTab.value === 'students') {
        fetchStudents()
      }
    })

    return {
      course,
      levelType,
      loading,
      activeTab,
      chapters,
      assignments,
      students,
      studentsLoading,
      studentDetailDialog,
      chapterDialog,
      assignmentDialog,
      formatDate,
      handleAddChapter,
      handleEditChapter,
      handleDeleteChapter,
      handleChapterSubmit,
      handleAddAssignment,
      goToAssignmentDetail,
      beforeResourceUpload,
      uploadResource,
      beforeAttachmentUpload,
      uploadAttachment,
      handleViewStudentDetail,
      chapterFormRef,
      assignmentFormRef,
      getStatusType,
      getStatusText,
      handleAssignmentSubmit,
      getSubmissionStatusType,
      getSubmissionStatusText,
      getChapterStatusType,
      getChapterStatusText
    }
  }
}
</script>

<style scoped>
.course-detail {
  padding: 20px;
}

.course-info {
  display: flex;
  margin-bottom: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.cover-container {
  width: 300px;
  height: 200px;
  margin-right: 20px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.info-content {
  flex: 1;
}

.info-items {
  margin: 15px 0;
}

.info-item {
  margin-right: 15px;
}

.description {
  color: #606266;
  line-height: 1.6;
}

.detail-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.tab-header {
  margin-bottom: 20px;
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