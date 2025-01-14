<template>
  <div class="system-log">
    <!-- 筛选区域 -->
    <div class="filter-container">
      <el-select
        v-model="query.type"
        placeholder="日志类型"
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="访问日志" value="access" />
        <el-option label="错误日志" value="error" />
        <el-option label="审计日志" value="audit" />
      </el-select>
      
      <el-date-picker
        v-model="query.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
        value-format="YYYY-MM-DD"
      />
      
      <el-button
        type="primary"
        class="filter-item"
        :loading="loading"
        @click="handleSearch"
      >
        搜索
      </el-button>
    </div>

    <!-- 日志列表 -->
    <el-table
      v-loading="loading"
      :data="logList"
      style="width: 100%"
      border
    >
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getLogType(row.type)">
            {{ getLogLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="内容" show-overflow-tooltip />
      <el-table-column label="详情" width="80">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="showDetails(row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="600px"
    >
      <div v-if="selectedLog" class="log-details">
        <div class="detail-item">
          <span class="label">时间：</span>
          <span>{{ formatDate(selectedLog.timestamp) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">类型：</span>
          <el-tag :type="getLogType(selectedLog.type)">
            {{ getLogLabel(selectedLog.type) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">内容：</span>
          <span>{{ selectedLog.message }}</span>
        </div>
        <div class="detail-item">
          <span class="label">详细信息：</span>
          <pre class="json-content">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogs } from '@/api/admin'

export default {
  name: 'SystemLog',
  setup() {
    // 查询参数
    const query = reactive({
      page: 1,
      limit: 20,
      type: 'access',
      dateRange: []
    })

    // 数据列表
    const loading = ref(false)
    const logList = ref([])
    const total = ref(0)

    // 详情对话框
    const dialogVisible = ref(false)
    const selectedLog = ref(null)

    // 获取日志列表
    const fetchLogs = async () => {
      loading.value = true
      try {
        const params = {
          ...query,
          startDate: query.dateRange[0],
          endDate: query.dateRange[1]
        }
        const res = await getLogs(params)
        logList.value = res.data.logs
        total.value = res.data.total
      } catch (error) {
        console.error('Fetch logs error:', error)
        ElMessage.error('获取日志列表失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      query.page = 1
      fetchLogs()
    }

    // 分页
    const handleSizeChange = (val) => {
      query.limit = val
      fetchLogs()
    }
    const handleCurrentChange = (val) => {
      query.page = val
      fetchLogs()
    }

    // 显示详情
    const showDetails = (log) => {
      selectedLog.value = log
      dialogVisible.value = true
    }

    // 工具函数
    const getLogType = (type) => {
      const types = {
        access: '',
        audit: 'success',
        error: 'danger'
      }
      return types[type] || 'info'
    }

    const getLogLabel = (type) => {
      const labels = {
        access: '访问',
        audit: '审计',
        error: '错误'
      }
      return labels[type] || type
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }

    onMounted(() => {
      fetchLogs()
    })

    return {
      query,
      loading,
      logList,
      total,
      dialogVisible,
      selectedLog,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      showDetails,
      getLogType,
      getLogLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.system-log {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-item {
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.log-details {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item .label {
  display: inline-block;
  width: 80px;
  color: #606266;
  font-weight: bold;
}

.json-content {
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}
</style> 