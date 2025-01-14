export default {
  path: '/admin',
  component: () => import('@/views/layout/AppLayout.vue'),
  redirect: '/admin/dashboard',
  meta: { 
    title: '系统管理',
    roles: ['admin']
  },
  children: [
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { title: '控制面板' }
    },
    {
      path: 'users',
      name: 'UserManage',
      component: () => import('@/views/admin/UserManage.vue'),
      meta: { title: '用户管理' }
    },
    {
      path: 'logs',
      name: 'SystemLog',
      component: () => import('@/views/admin/SystemLog.vue'),
      meta: { title: '系统日志' }
    },
    {
      path: 'backup',
      name: 'SystemBackup',
      component: () => import('@/views/admin/SystemBackup.vue'),
      meta: { title: '系统备份' }
    }
  ]
} 