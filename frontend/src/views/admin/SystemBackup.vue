<template>
  <div class="system-backup">
    <!-- 操作按钮 -->
    <div class="operation-container">
      <el-button 
        type="primary" 
        :loading="backingUp"
        @click="handleBackup"
      >
        立即备份
      </el-button>
    </div>

    <!-- 备份记录列表 -->
    <el-table
      v-loading="loading"
      :data="backupList"
      style="width: 100%"
      border
    >
      <el-table-column prop="filename" label="备份文件" show-overflow-tooltip />
      <el-table-column prop="timestamp" label="备份时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button
            type="warning"
            size="small"
            :loading="row.restoring"
            @click="handleRestore(row)"
          >
            恢复
          </el-button>
          <el-button
            type="danger"
            size="small"
            :loading="row.deleting"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBackups, backupSystem, restoreSystem, deleteBackup } from '@/api/admin'

export default {
  name: 'SystemBackup',
  setup() {
    const loading = ref(false)
    const backingUp = ref(false)
    const backupList = ref([])

    // 获取备份记录列表
    const fetchBackupList = async () => {
      loading.value = true
      try {
        const res = await getBackups()
        backupList.value = res.data.map(item => ({
          ...item,
          restoring: false,
          deleting: false
        }))
      } catch (error) {
        console.error('Fetch backup list error:', error)
        ElMessage.error('获取备份记录失败')
      } finally {
        loading.value = false
      }
    }

    // 立即备份
    const handleBackup = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要创建系统备份吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )

        backingUp.value = true
        await backupSystem()
        ElMessage.success('系统备份成功')
        fetchBackupList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Backup error:', error)
          ElMessage.error('系统备份失败')
        }
      } finally {
        backingUp.value = false
      }
    }

    // 从备份恢复
    const handleRestore = async (backup) => {
      try {
        await ElMessageBox.confirm(
          '确定要从该备份恢复系统吗？恢复过程中系统将暂时无法使用。',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        backup.restoring = true
        await restoreSystem({ filename: backup.filename })
        ElMessage.success('系统恢复成功，请重新登录')
        // 重定向到登录页
        window.location.href = '/login'
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Restore error:', error)
          ElMessage.error('系统恢复失败')
        }
      } finally {
        backup.restoring = false
      }
    }

    // 删除备份
    const handleDelete = async (backup) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除该备份吗？此操作不可恢复。',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        backup.deleting = true
        await deleteBackup({ filename: backup.filename })
        ElMessage.success('删除成功')
        fetchBackupList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete backup error:', error)
          ElMessage.error('删除备份失败')
        }
      } finally {
        backup.deleting = false
      }
    }

    // 工具函数
    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }

    const formatSize = (bytes) => {
      if (!bytes) return '-'
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(2)} ${units[unitIndex]}`
    }

    onMounted(() => {
      fetchBackupList()
    })

    return {
      loading,
      backingUp,
      backupList,
      handleBackup,
      handleRestore,
      handleDelete,
      formatDate,
      formatSize
    }
  }
}
</script>

<style scoped>
.system-backup {
  padding: 20px;
}

.operation-container {
  margin-bottom: 20px;
}
</style> 