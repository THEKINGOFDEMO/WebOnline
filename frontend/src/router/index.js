import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import { getToken } from '@/utils/auth'
import authRoutes from './modules/auth'
import studentRoutes from './modules/student'
import teacherRoutes from './modules/teacher'
import adminRoutes from './modules/admin'

// 公共路由
export const constantRoutes = [
  {
    path: '/',
    redirect: () => {
      const token = getToken()
      if (!token) {
        return '/auth/login'
      }
      const role = store.getters.role
      if (role === 'admin') {
        return '/admin/dashboard'
      } else if (role === 'teacher') {
        return '/teacher/courses'
      } else if (role === 'student') {
        return '/student/course-square'
      }
      return '/auth/login'
    }
  },
  authRoutes,
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/course/:id/study',
    name: 'CourseStudy',
    component: () => import('@/views/student/CourseStudy.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/chapter/:id/study',
    name: 'ChapterStudy',
    component: () => import('@/views/student/ChapterStudy.vue'),
    meta: { requiresAuth: true, role: 'student' }
  }
]

// 权限路由
export const asyncRoutes = [
  studentRoutes,
  teacherRoutes,
  adminRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 白名单
const whiteList = ['/auth/login', '/auth/register', '/auth/reset-password']

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/auth/login') {
      next({ path: '/' })
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息
          const { role } = await store.dispatch('user/getInfo')
          
          // 根据角色生成可访问路由
          const accessRoutes = filterAsyncRoutes(asyncRoutes, [role])
          
          // 动态添加路由
          for (const route of accessRoutes) {
            router.addRoute(route)
          }

          // 确保路由已经添加完成
          next({ ...to, replace: true })
        } catch (error) {
          // 移除 token 并跳转登录页
          await store.dispatch('user/fedLogout')
          next(`/auth/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/auth/login?redirect=${to.path}`)
    }
  }
})

// 根据角色过滤路由
function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

// 判断是否有权限
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

export default router 