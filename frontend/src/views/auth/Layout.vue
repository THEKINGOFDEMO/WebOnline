<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-header">
        <h2>在线学习平台</h2>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>

<style scoped>
.auth-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.auth-content {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h2 {
  color: #303133;
  margin: 0;
}
</style> 