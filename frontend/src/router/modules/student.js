export default {
  path: '/student',
  component: () => import('@/views/layout/AppLayout.vue'),
  redirect: '/student/course-square',
  meta: { 
    title: '学生空间',
    roles: ['student']
  },
  children: [
    {
      path: 'course-square',
      name: 'CourseSquare',
      component: () => import('@/views/student/CourseSquare.vue'),
      meta: { title: '课程广场' }
    },
    {
      path: 'my-courses',
      name: 'MyCourses',
      component: () => import('@/views/student/MyCourses.vue'),
      meta: { title: '我的课程' }
    },
    {
      path: 'course/:id/study',
      name: 'CourseStudy',
      component: () => import('@/views/student/CourseStudy.vue'),
      meta: { title: '课程学习' }
    },
    {
      path: 'course/:id/enroll',
      name: 'CourseEnroll',
      component: () => import('@/views/student/CourseEnroll.vue'),
      meta: { title: '课程报名' }
    },
    {
      path: 'assignments',
      name: 'MyAssignments',
      component: () => import('@/views/student/MyAssignments.vue'),
      meta: { title: '我的作业' }
    },
    {
      path: 'profile',
      name: 'StudentProfile',
      component: () => import('@/views/student/StudentProfile.vue'),
      meta: { title: '个人信息' }
    }
  ]
} 