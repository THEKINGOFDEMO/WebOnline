<template>
  <div class="register-container">
    <div class="register-form">
      <div class="register-banner">
        <h1>在线学习平台</h1>
        <p>欢迎来到我们的在线学习平台！这里有丰富的课程资源和专业的教师团队，让我们一起开启学习之旅。</p>
      </div>
      <el-form
        ref="registerForm"
        :model="form"
        :rules="rules"
        class="register-form-content"
        label-position="top"
      >
        <h2 class="register-title">账号注册</h2>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" prefix-icon="Message" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" class="role-select">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="register-button" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>

        <div class="register-links">
          <router-link to="/auth/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth'

export default {
  name: 'UserRegister',
  setup() {
    const router = useRouter()
    const registerForm = ref(null)
    const loading = ref(false)
    
    const form = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      role: ''
    })
    
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (form.confirmPassword !== '') {
          registerForm.value?.validateField('confirmPassword')
        }
        callback()
      }
    }
    
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ]
    }
    
    const handleRegister = async () => {
      if (!registerForm.value) return
      
      try {
        await registerForm.value.validate()
        loading.value = true
        
        const { username, password, email, role } = form
        await register({ username, password, email, role })
        
        ElMessage.success('注册成功')
        router.push('/auth/login')
      } catch (error) {
        console.error('Registration failed:', error)
        ElMessage.error(error.message || '注册失败')
      } finally {
        loading.value = false
      }
    }
    
    return {
      registerForm,
      form,
      rules,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: linear-gradient(120deg, #2b4b80 0%, #1890ff 100%);
  overflow: hidden;
}

.register-form {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.register-banner {
  width: 65%;
  height: 100%;
  padding: 0;
  background: linear-gradient(135deg, #1890ff 0%, #2b4b80 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.register-banner h1 {
  font-size: 56px;
  font-weight: 600;
  color: white;
  margin-bottom: 24px;
  line-height: 1.2;
}

.register-banner p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin: 0;
  max-width: 600px;
  text-align: center;
}

.register-form-content {
  width: 35%;
  height: 100%;
  padding: 0 80px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-title {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 48px;
  text-align: center;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
}

.register-form :deep(.el-input) {
  height: 44px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  background: white;
}

.register-form :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.role-select {
  width: 100%;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  margin-top: 12px;
  background: linear-gradient(to right, #1890ff, #2b4b80);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.register-links {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  font-size: 14px;
}

.register-links a {
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
}

.register-links a:hover {
  color: #1890ff;
}
</style> 