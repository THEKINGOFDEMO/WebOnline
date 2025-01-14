export default {
  path: '/auth',
  component: () => import('@/views/auth/Layout.vue'),
  redirect: '/auth/login',
  hidden: true,
  children: [
    {
      path: 'login',
      name: 'UserLogin',
      component: () => import('@/views/auth/UserLogin.vue'),
      meta: { title: '登录' }
    },
    {
      path: 'register',
      name: 'UserRegister',
      component: () => import('@/views/auth/UserRegister.vue'),
      meta: { title: '注册' }
    },
    {
      path: 'reset-password',
      name: 'UserResetPassword',
      component: () => import('@/views/auth/UserResetPassword.vue'),
      meta: { title: '重置密码' }
    }
  ]
} 