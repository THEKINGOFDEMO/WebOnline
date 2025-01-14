<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-banner">
        <h1>在线学习平台</h1>
        <p>欢迎来到我们的在线学习平台！这里有丰富的课程资源和专业的教师团队，让我们一起开启学习之旅。</p>
      </div>
      <el-form
        ref="loginForm"
        :model="loginData"
        :rules="loginRules"
        class="login-form-content"
        @submit.prevent="handleLogin"
      >
        <h2 class="login-title">账号登录</h2>
        <el-form-item prop="username">
          <el-input
            v-model="loginData.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginData.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        <div class="login-links">
          <router-link to="/auth/register">注册账号</router-link>
          <router-link to="/auth/reset-password">忘记密码？</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserLogin',
  setup() {
    const store = useStore()
    const loginForm = ref(null)
    const loading = ref(false)

    const loginData = reactive({
      username: '',
      password: ''
    })

    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginForm.value) return
      
      try {
        loading.value = true
        await loginForm.value.validate()
        
        // 登录并获取用户信息
        await store.dispatch('user/login', loginData)
        const { role } = await store.dispatch('user/getInfo')
        
        // 根据用户角色确定重定向路径
        let redirectPath = '/'
        if (role === 'admin') {
          redirectPath = '/admin/dashboard'
        } else if (role === 'teacher') {
          redirectPath = '/teacher/courses'
        } else {
          redirectPath = '/student/course-square'
        }

        // 使用 replace 而不是 push，避免浏览器历史记录问题
        window.location.replace(redirectPath)
        
        ElMessage.success('登录成功')
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error(error.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      loginData,
      loginRules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: linear-gradient(120deg, #2b4b80 0%, #1890ff 100%);
  overflow: hidden;
}

.login-form {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.login-banner {
  width: 65%;
  height: 100%;
  padding: 0;
  background: linear-gradient(135deg, #1890ff 0%, #2b4b80 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-banner h1 {
  font-size: 56px;
  font-weight: 600;
  color: white;
  margin-bottom: 24px;
  line-height: 1.2;
}

.login-banner p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin: 0;
  max-width: 600px;
  text-align: center;
}

.login-form-content {
  width: 35%;
  height: 100%;
  padding: 0 80px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 48px;
  text-align: center;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 30px;
}

.login-form :deep(.el-input) {
  height: 44px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  background: white;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.login-button {
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

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  font-size: 14px;
}

.login-links a {
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-links a:hover {
  color: #1890ff;
}
</style> 