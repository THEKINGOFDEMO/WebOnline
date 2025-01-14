export default {
  path: '/teacher',
  component: () => import('@/views/layout/AppLayout.vue'),
  redirect: '/teacher/courses',
  meta: { 
    title: '教师空间',
    roles: ['teacher']
  },
  children: [
    {
      path: 'courses',
      name: 'TeacherCourses',
      component: () => import('@/views/teacher/CourseManage.vue'),
      meta: { title: '课程管理' }
    },
    {
      path: 'course/create',
      name: 'CreateCourse',
      component: () => import('@/views/teacher/CourseForm.vue'),
      meta: { title: '创建课程' }
    },
    {
      path: 'course/:id',
      name: 'TeacherCourseDetail',
      component: () => import('@/views/teacher/CourseDetail.vue'),
      meta: { title: '课程详情' }
    },
    {
      path: 'course/:id/edit',
      name: 'EditCourse',
      component: () => import('@/views/teacher/CourseForm.vue'),
      meta: { title: '编辑课程' }
    },
    {
      path: 'assignments',
      name: 'AssignmentManage',
      component: () => import('@/views/teacher/AssignmentManage.vue'),
      meta: { title: '作业管理' }
    },
    {
      path: 'students',
      name: 'StudentManage',
      component: () => import('@/views/teacher/StudentManage.vue'),
      meta: { title: '学生管理' }
    },
    {
      path: 'profile',
      name: 'TeacherProfile',
      component: () => import('@/views/teacher/TeacherProfile.vue'),
      meta: { title: '个人信息' }
    }
  ]
} 