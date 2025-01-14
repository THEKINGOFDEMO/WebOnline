<template>
  <div class="course-form">
    <div class="form-header">
      <h2>{{ isEdit ? '编辑课程' : '创建课程' }}</h2>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="course-form-content"
    >
      <el-form-item label="课程封面" prop="coverImage">
        <el-upload
          class="cover-uploader"
          :show-file-list="false"
          :before-upload="beforeCoverUpload"
          :http-request="uploadCover"
        >
          <img v-if="form.coverImage" :src="form.coverImage" class="cover-image" />
          <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">建议尺寸: 800x400px, 支持jpg、png格式</div>
      </el-form-item>

      <el-form-item label="课程名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入课程名称" />
      </el-form-item>

      <el-form-item label="课程分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择课程分类">
          <el-option label="编程开发" value="programming" />
          <el-option label="设计创意" value="design" />
          <el-option label="商务管理" value="business" />
          <el-option label="语言学习" value="language" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="难度等级" prop="level">
        <el-select v-model="form.level" placeholder="请选择难度等级">
          <el-option label="初级" value="beginner" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="advanced" />
        </el-select>
      </el-form-item>

      <el-form-item label="课程简介" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入课程简介"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '保存修改' : '创建课程' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { createCourse, getCourseDetail, updateCourse, updateCourseCover } from '@/api/course'

export default {
  name: 'CourseForm',
  components: {
    Plus
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref(null)
    const loading = ref(false)
    const isEdit = ref(false)

    const form = reactive({
      title: '',
      category: '',
      level: '',
      description: '',
      coverImage: ''
    })

    const rules = {
      title: [
        { required: true, message: '请输入课程名称', trigger: 'blur' },
        { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择课程分类', trigger: 'change' }
      ],
      level: [
        { required: true, message: '请选择难度等级', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入课程简介', trigger: 'blur' },
        { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
      ]
    }

    const beforeCoverUpload = (file) => {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('封面图片只能是 JPG 或 PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('封面图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    const uploadCover = async (options) => {
      try {
        const formData = new FormData()
        formData.append('coverImage', options.file)
        
        if (isEdit.value) {
          const res = await updateCourseCover(route.params.id, formData)
          form.coverImage = res.coverImage
          ElMessage.success('封面上传成功')
        } else {
          // 在创建课程时，先保存文件对象，等提交表单时一起发送
          form.coverImageFile = options.file
          // 创建预览URL
          form.coverImage = URL.createObjectURL(options.file)
        }
      } catch (error) {
        console.error('Upload cover error:', error)
        ElMessage.error('封面上传失败')
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        loading.value = true

        if (isEdit.value) {
          await updateCourse(route.params.id, form)
          ElMessage.success('课程更新成功')
        } else {
          // 创建 FormData 对象
          const formData = new FormData()
          formData.append('title', form.title)
          formData.append('category', form.category)
          formData.append('level', form.level)
          formData.append('description', form.description)
          if (form.coverImageFile) {
            formData.append('coverImage', form.coverImageFile)
          }
          
          await createCourse(formData)
          ElMessage.success('课程创建成功')
        }
        
        router.push('/teacher/courses')
      } catch (error) {
        console.error('Submit form error:', error)
        ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
      } finally {
        loading.value = false
      }
    }

    const handleCancel = () => {
      router.back()
    }

    const fetchCourseDetail = async (id) => {
      try {
        loading.value = true
        const res = await getCourseDetail(id)
        Object.assign(form, res.data)
      } catch (error) {
        console.error('Fetch course detail error:', error)
        ElMessage.error('获取课程信息失败')
        router.back()
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      const id = route.params.id
      if (id) {
        isEdit.value = true
        fetchCourseDetail(id)
      }
    })

    return {
      formRef,
      form,
      rules,
      loading,
      isEdit,
      beforeCoverUpload,
      uploadCover,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.course-form {
  padding: 20px;
}

.form-header {
  margin-bottom: 30px;
}

.course-form-content {
  max-width: 800px;
}

.cover-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration);
}

.cover-uploader:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 400px;
  height: 200px;
  text-align: center;
  line-height: 200px;
}

.cover-image {
  width: 400px;
  height: 200px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
</style> 