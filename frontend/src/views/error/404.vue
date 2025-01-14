<template>
  <div class="error-page">
    <div class="error-code">404</div>
    <div class="error-desc">抱歉，您访问的页面不存在</div>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.error-code {
  font-size: 120px;
  color: #409EFF;
  margin-bottom: 20px;
}

.error-desc {
  font-size: 24px;
  color: #606266;
  margin-bottom: 30px;
}
</style> 