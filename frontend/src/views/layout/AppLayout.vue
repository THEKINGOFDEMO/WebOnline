<template>
  <div class="app-wrapper">
    <app-sidebar class="sidebar-container" />
    <div class="main-container">
      <app-header class="header" />
      <div class="app-main">
        <router-view />
      </div>
      <app-footer />
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppSidebar,
    AppFooter
  }
}
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #304156;
  z-index: 1001;
  transition: width 0.28s;
}

.main-container {
  min-height: 100%;
  margin-left: 210px;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  height: 50px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.app-main {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
}
</style> 