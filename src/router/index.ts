import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/exam/:id',
      name: 'exam',
      component: () => import('@/views/ExamView.vue'),
      props: true
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/subjects',
      name: 'subjects',
      component: () => import('@/views/SubjectsView.vue')
    },
    {
      path: '/questions',
      name: 'questions',
      component: () => import('@/views/QuestionView.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue')
    }
  ]
})

export default router