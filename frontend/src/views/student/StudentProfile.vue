<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="avatar-container">
          <el-avatar :size="100" :src="profile.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
          >
            <el-button type="primary" link>更换头像</el-button>
          </el-upload>
        </div>

        <div class="info-container">
          <div class="info-item">
            <label>用户名：</label>
            <span>{{ profile.username }}</span>
          </div>
          <div class="info-item">
            <label>姓名：</label>
            <span>{{ profile.name }}</span>
          </div>
          <div class="info-item">
            <label>邮箱：</label>
            <span>{{ profile.email }}</span>
          </div>
          <div class="info-item">
            <label>角色：</label>
            <el-tag size="small">{{ getRoleText(profile.role) }}</el-tag>
          </div>
          <div class="info-item">
            <label>注册时间：</label>
            <span>{{ formatDate(profile.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>最后登录：</label>
            <span>{{ formatDate(profile.lastLogin) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>个人设置</span>
        </div>
      </template>
      
      <div class="settings-content">
        <div class="setting-item">
          <span class="setting-label">邮件通知</span>
          <el-switch
            v-model="settings.notification.email"
            @change="handleSettingChange"
          />
        </div>
        <div class="setting-item">
          <span class="setting-label">作业提醒</span>
          <el-switch
            v-model="settings.notification.assignment"
            @change="handleSettingChange"
          />
        </div>
        <div class="setting-item">
          <span class="setting-label">考试提醒</span>
          <el-switch
            v-model="settings.notification.exam"
            @change="handleSettingChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑个人信息"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { getProfile, updateProfile, uploadAvatar } from '@/api/user'
import { getSettings, updateSettings } from '@/api/user'

export default {
  name: 'StudentProfile',
  components: {
    User
  },
  setup() {
    const profile = ref({
      avatar: '',
      username: '',
      name: '',
      email: '',
      role: '',
      createdAt: '',
      lastLogin: ''
    })
    const settings = ref({
      notification: {
        email: false,
        assignment: false,
        exam: false
      }
    })
    const loading = ref(false)
    const saving = ref(false)
    const dialogVisible = ref(false)
    
    const form = reactive({
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

    const formRef = ref(null)

    const fetchProfile = async () => {
      try {
        loading.value = true
        const res = await getProfile()
        if (res.user) {
          profile.value = {
            ...profile.value,
            ...res.user
          }
        }
      } catch (error) {
        console.error('Fetch profile error:', error)
        ElMessage.error('获取个人信息失败')
      } finally {
        loading.value = false
      }
    }

    const fetchSettings = async () => {
      try {
        const res = await getSettings()
        if (res.data) {
          settings.value = {
            notification: {
              ...settings.value.notification,
              ...res.data.notification
            }
          }
        }
      } catch (error) {
        console.error('Fetch settings error:', error)
        ElMessage.error('获取个人设置失败')
      }
    }

    const handleEdit = () => {
      form.name = profile.value.name
      form.email = profile.value.email
      dialogVisible.value = true
    }

    const handleSave = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            saving.value = true
            await updateProfile(form)
            ElMessage.success('保存成功')
            dialogVisible.value = false
            fetchProfile()
          } catch (error) {
            console.error('Update profile error:', error)
            ElMessage.error('保存失败')
          } finally {
            saving.value = false
          }
        }
      })
    }

    const handleAvatarChange = async (file) => {
      const formData = new FormData()
      formData.append('avatar', file.raw)
      
      try {
        await uploadAvatar(formData)
        ElMessage.success('头像上传成功')
        fetchProfile()
      } catch (error) {
        console.error('Upload avatar error:', error)
        ElMessage.error('头像上传失败')
      }
    }

    const handleSettingChange = async () => {
      try {
        await updateSettings(settings.value)
        ElMessage.success('设置已更新')
      } catch (error) {
        console.error('Update settings error:', error)
        ElMessage.error('设置更新失败')
      }
    }

    const getRoleText = (role) => {
      const roleMap = {
        student: '学生',
        teacher: '教师',
        admin: '管理员'
      }
      return roleMap[role] || '未知'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    onMounted(() => {
      fetchProfile()
      fetchSettings()
    })

    return {
      profile,
      settings,
      loading,
      saving,
      dialogVisible,
      form,
      rules,
      formRef,
      handleEdit,
      handleSave,
      handleAvatarChange,
      handleSettingChange,
      getRoleText,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  display: flex;
  gap: 20px;
}

.profile-card {
  flex: 2;
}

.settings-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  display: flex;
  gap: 30px;
}

.avatar-container {
  text-align: center;
}

.avatar-uploader {
  margin-top: 10px;
}

.info-container {
  flex: 1;
}

.info-item {
  margin-bottom: 15px;
  font-size: 14px;
}

.info-item label {
  color: #909399;
  margin-right: 10px;
}

.settings-content {
  padding: 10px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.setting-label {
  font-size: 14px;
  color: #606266;
}
</style> 