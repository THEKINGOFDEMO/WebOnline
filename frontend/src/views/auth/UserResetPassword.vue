<template>
  <div class="reset-password-container">
    <el-form
      ref="resetForm"
      :model="resetData"
      :rules="resetRules"
      class="reset-form"
      @submit.prevent="handleReset"
    >
      <el-form-item prop="email">
        <el-input
          v-model="resetData.email"
          placeholder="邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      <el-form-item prop="newPassword">
        <el-input
          v-model="resetData.newPassword"
          type="password"
          placeholder="新密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="resetData.confirmPassword"
          type="password"
          placeholder="确认新密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="reset-button"
          @click="handleReset"
        >
          重置密码
        </el-button>
      </el-form-item>
      <div class="reset-links">
        <router-link to="/auth/login">返回登录</router-link>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resetPassword } from '@/api/auth'

export default {
  name: 'UserResetPassword',
  setup() {
    const router = useRouter()
    const resetForm = ref(null)
    const loading = ref(false)

    const resetData = reactive({
      email: '',
      newPassword: '',
      confirmPassword: ''
    })

    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else {
        if (resetData.confirmPassword !== '') {
          resetForm.value?.validateField('confirmPassword')
        }
        callback()
      }
    }

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'))
      } else if (value !== resetData.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    const resetRules = {
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
      ]
    }

    const handleReset = async () => {
      if (!resetForm.value) return
      
      try {
        loading.value = true
        await resetForm.value.validate()
        
        // eslint-disable-next-line no-unused-vars
        const { confirmPassword, ...resetPayload } = resetData
        await resetPassword(resetPayload)
        
        ElMessage.success('密码重置成功，请使用新密码登录')
        router.push('/auth/login')
      } catch (error) {
        console.error('Reset password error:', error)
        ElMessage.error(error.message || '密码重置失败，请重试')
      } finally {
        loading.value = false
      }
    }

    return {
      resetForm,
      resetData,
      resetRules,
      loading,
      handleReset
    }
  }
}
</script>

<style scoped>
.reset-password-container {
  width: 100%;
}

.reset-form {
  width: 100%;
}

.reset-button {
  width: 100%;
}

.reset-links {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.reset-links a {
  color: #409eff;
  text-decoration: none;
}

.reset-links a:hover {
  color: #66b1ff;
}
</style> 