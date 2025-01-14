<template>
  <div class="profile-container">
    <el-card class="profile-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleEdit">编辑</el-button>
            <el-button @click="handleBack">返回</el-button>
          </div>
        </div>
      </template>
      <div class="profile-content">
        <div class="avatar-container">
          <el-avatar :size="100" :src="userInfo?.avatar || ''" />
          <el-upload
            v-if="isEditing"
            class="avatar-uploader"
            :action="`${baseURL}/users/avatar`"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <el-button size="small" type="primary">更换头像</el-button>
          </el-upload>
        </div>
        <el-form ref="profileForm" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="用户名">
            <span v-if="!isEditing">{{ userInfo?.username }}</span>
            <el-input v-else v-model="form.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <span v-if="!isEditing">{{ userInfo?.name }}</span>
            <el-input v-else v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <span v-if="!isEditing">{{ userInfo?.email }}</span>
            <el-input v-else v-model="form.email"></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-tag>{{ userInfo?.role === 'teacher' ? '教师' : '' }}</el-tag>
          </el-form-item>
          <el-form-item label="注册时间">
            <span>{{ formatDate(userInfo?.createdAt) }}</span>
          </el-form-item>
          <el-form-item label="最后登录">
            <span>{{ formatDate(userInfo?.lastLogin) }}</span>
          </el-form-item>
          <el-form-item v-if="isEditing">
            <el-button type="primary" @click="handleSubmit">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProfile, updateProfile } from '@/api/user'

export default {
  name: 'TeacherProfile',
  setup() {
    const store = useStore()
    const router = useRouter()
    const profileForm = ref(null)
    const isEditing = ref(false)
    const loading = ref(true)
    const userInfo = computed(() => store.state.user.userInfo)
    const baseURL = process.env.VUE_APP_BASE_API
    const headers = computed(() => ({
      Authorization: `Bearer ${store.state.user.token}`
    }))

    const form = reactive({
      username: '',
      name: '',
      email: ''
    })

    const rules = {
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ]
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        loading.value = true
        const res = await getProfile()
        if (res.success) {
          store.commit('user/SET_USER_INFO', res.user)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      } finally {
        loading.value = false
      }
    }

    const handleEdit = () => {
      if (!userInfo.value) return
      isEditing.value = true
      form.username = userInfo.value.username
      form.name = userInfo.value.name
      form.email = userInfo.value.email
    }

    const cancelEdit = () => {
      isEditing.value = false
      profileForm.value?.resetFields()
    }

    const handleSubmit = async () => {
      if (!profileForm.value) return
      
      try {
        await profileForm.value.validate()
        await updateProfile({
          name: form.name,
          email: form.email
        })
        await fetchUserInfo()
        isEditing.value = false
        ElMessage.success('个人资料更新成功')
      } catch (error) {
        console.error('更新个人资料失败:', error)
        ElMessage.error('更新个人资料失败')
      }
    }

    const handleAvatarSuccess = async (/* response */) => {
      await fetchUserInfo()
      ElMessage.success('头像更新成功')
    }

    const beforeAvatarUpload = (file) => {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        ElMessage.error('头像图片只能是 JPG 或 PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('头像图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    const formatDate = (date) => {
      if (!date) return '暂无'
      return new Date(date).toLocaleString()
    }

    const handleBack = () => {
      router.push('/teacher/courses')
    }

    onMounted(() => {
      fetchUserInfo()
    })

    return {
      profileForm,
      isEditing,
      loading,
      userInfo,
      form,
      rules,
      baseURL,
      headers,
      handleEdit,
      cancelEdit,
      handleSubmit,
      handleAvatarSuccess,
      beforeAvatarUpload,
      formatDate,
      handleBack
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.profile-content {
  padding: 20px;
}

.avatar-container {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  margin-top: 10px;
}
</style> 