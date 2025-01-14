<template>
  <div class="enrolled-course-card" @click="handleClick">
    <div class="course-cover">
      <el-image 
        :src="coverImageUrl" 
        fit="cover"
        :lazy="true"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
    </div>
    <div class="course-info">
      <h3 class="course-title">{{ course.title }}</h3>
      <div class="teacher-info">
        <el-icon><User /></el-icon>
        <span>{{ course.teacherName }}</span>
      </div>
      <div class="course-progress">
        <span class="progress-text">学习进度: {{ course.progress }}%</span>
        <el-progress 
          :percentage="course.progress" 
          :status="course.progress === 100 ? 'success' : ''"
          :stroke-width="8"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Picture, User } from '@element-plus/icons-vue'

export default {
  name: 'EnrolledCourseCard',
  components: {
    Picture,
    User
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()

    const coverImageUrl = computed(() => {
      if (!props.course.coverImage) return ''
      return props.course.coverImage.startsWith('/api') 
        ? props.course.coverImage 
        : `/api${props.course.coverImage}`
    })

    const handleClick = () => {
      router.push({
        name: 'CourseStudy',
        params: { id: props.course._id }
      })
    }

    return {
      coverImageUrl,
      handleClick
    }
  }
}
</script>

<style scoped>
.enrolled-course-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.enrolled-course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.15);
}

.course-cover {
  height: 160px;
  overflow: hidden;
}

.course-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.course-info {
  padding: 15px;
}

.course-title {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
}

.teacher-info .el-icon {
  font-size: 16px;
}

.course-progress {
  margin-top: 10px;
}

.progress-text {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}
</style> 