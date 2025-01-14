<template>
  <div class="sidebar">
    <div class="logo">
      <span>在线学习平台</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :router="true"
      :unique-opened="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF">
      
      <template v-if="isStudent">
        <el-menu-item index="/student/course-square">
          <el-icon><Grid /></el-icon>
          <span>课程广场</span>
        </el-menu-item>
        
        <el-menu-item index="/student/my-courses">
          <el-icon><Collection /></el-icon>
          <span>我的课程</span>
        </el-menu-item>
        
        <el-menu-item index="/student/assignments">
          <el-icon><Document /></el-icon>
          <span>我的作业</span>
        </el-menu-item>
      </template>
      
      <template v-if="isTeacher">
        <el-menu-item index="/teacher/courses">
          <el-icon><Reading /></el-icon>
          <span>课程管理</span>
        </el-menu-item>
        
        <el-menu-item index="/teacher/assignments">
          <el-icon><Document /></el-icon>
          <span>作业管理</span>
        </el-menu-item>
        
        <el-menu-item index="/teacher/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
      </template>
      
      <template v-if="isAdmin">
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>控制面板</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/logs">
          <el-icon><List /></el-icon>
          <span>系统日志</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/backup">
          <el-icon><Files /></el-icon>
          <span>系统备份</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { 
  Grid, Collection, Document, Reading, 
  User, DataLine, UserFilled, List, Files 
} from '@element-plus/icons-vue'

export default {
  name: 'AppSidebar',
  components: {
    Grid, Collection, Document, Reading,
    User, DataLine, UserFilled, List, Files
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    const roles = computed(() => store.getters.roles)
    const isStudent = computed(() => roles.value.includes('student'))
    const isTeacher = computed(() => roles.value.includes('teacher'))
    const isAdmin = computed(() => roles.value.includes('admin'))
    
    const activeMenu = computed(() => route.path)

    return {
      isStudent,
      isTeacher,
      isAdmin,
      activeMenu
    }
  }
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
}

:deep(.el-icon) {
  margin-right: 16px;
  width: 1em;
  height: 1em;
}
</style> 