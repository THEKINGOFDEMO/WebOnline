.sidebar-container {
  height: 100vh;
  background: linear-gradient(180deg, #2c3e50 0%, #3498db 100%);
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.sidebar-container::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.logo-container {
  padding: 0 20px;
  margin-bottom: 20px;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 0;
  padding: 10px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-wrapper {
  padding: 0 10px;
}

:deep(.el-menu) {
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 8px 0;
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  transition: all 0.3s ease;
}

:deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.1);
  color: #fff;
  transform: translateX(5px);
}

:deep(.el-menu-item.is-active) {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

:deep(.el-menu-item .el-icon) {
  margin-right: 12px;
  font-size: 18px;
  vertical-align: middle;
}

:deep(.el-menu-item span) {
  font-size: 14px;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .sidebar-container {
    width: 64px;
    padding: 20px 0;
  }

  .logo-title {
    display: none;
  }

  :deep(.el-menu-item span) {
    display: none;
  }

  :deep(.el-menu-item .el-icon) {
    margin: 0;
  }
} 