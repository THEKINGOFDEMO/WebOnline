<template>
  <div class="header-container">
    <div class="left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="right">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-wrapper">
          <el-avatar :size="32" :src="userInfo?.avatar">{{ userInfo?.name?.charAt(0) }}</el-avatar>
          <span class="username">{{ userInfo?.name }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const store = useStore()
    const router = useRouter()

    const userInfo = computed(() => store.getters.userInfo)

    const handleCommand = async (command) => {
      if (command === 'profile') {
        const role = store.getters.roles[0]
        router.push(`/${role}/profile`)
      } else if (command === 'logout') {
        await store.dispatch('user/logout')
        router.push('/auth/login')
      }
    }

    return {
      userInfo,
      handleCommand
    }
  }
}
</script>

<style scoped>
.header-container {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}
</style> 