<template>
  <div class="user-manage">
    <!-- 搜索和筛选区域 -->
    <div class="filter-container">
      <el-input
        v-model="query.keyword"
        placeholder="搜索用户名/邮箱"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-select
        v-model="query.role"
        placeholder="选择角色"
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="全部" value="" />
        <el-option label="学生" value="student" />
        <el-option label="教师" value="teacher" />
        <el-option label="管理员" value="admin" />
      </el-select>
      <el-button
        type="primary"
        class="filter-item"
        @click="handleSearch"
      >
        搜索
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-table
      v-loading="loading"
      :data="userList"
      style="width: 100%"
      border
    >
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="query.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'edit' ? '编辑用户' : '用户详情'"
      width="500px"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" disabled />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" style="width: 100%">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, getUserDetail, updateUser, deleteUser } from '@/api/admin'

export default {
  name: 'UserManage',
  setup() {
    // 查询参数
    const query = reactive({
      page: 1,
      limit: 10,
      keyword: '',
      role: ''
    })

    // 数据列表
    const loading = ref(false)
    const userList = ref([])
    const total = ref(0)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogType = ref('edit')
    const userForm = ref({})
    const userRules = {
      role: [{ required: true, message: '请选择角色', trigger: 'change' }],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    }

    // 获取用户列表
    const fetchUsers = async () => {
      loading.value = true
      try {
        const res = await getUsers(query)
        userList.value = res.data.users
        total.value = res.data.total
      } catch (error) {
        console.error('Fetch users error:', error)
        ElMessage.error('获取用户列表失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      query.page = 1
      fetchUsers()
    }

    // 分页
    const handleSizeChange = (val) => {
      query.limit = val
      fetchUsers()
    }
    const handleCurrentChange = (val) => {
      query.page = val
      fetchUsers()
    }

    // 编辑用户
    const handleEdit = async (row) => {
      dialogType.value = 'edit'
      dialogVisible.value = true
      try {
        const res = await getUserDetail(row._id)
        userForm.value = res.data
      } catch (error) {
        console.error('Get user detail error:', error)
        ElMessage.error('获取用户详情失败')
      }
    }

    // 删除用户
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        '确定要删除该用户吗？此操作不可恢复。',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          try {
            await deleteUser(row._id)
            ElMessage.success('删除成功')
            fetchUsers()
          } catch (error) {
            console.error('Delete user error:', error)
            ElMessage.error('删除用户失败')
          }
        })
        .catch(() => {})
    }

    // 提交表单
    const handleSubmit = async () => {
      try {
        await updateUser(userForm.value._id, userForm.value)
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchUsers()
      } catch (error) {
        console.error('Update user error:', error)
        ElMessage.error('更新用户失败')
      }
    }

    // 工具函数
    const getRoleType = (role) => {
      const types = {
        student: '',
        teacher: 'success',
        admin: 'warning'
      }
      return types[role] || 'info'
    }

    const getRoleLabel = (role) => {
      const labels = {
        student: '学生',
        teacher: '教师',
        admin: '管理员'
      }
      return labels[role] || '未知'
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      query,
      loading,
      userList,
      total,
      dialogVisible,
      dialogType,
      userForm,
      userRules,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      handleEdit,
      handleDelete,
      handleSubmit,
      getRoleType,
      getRoleLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.user-manage {
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
</style> 