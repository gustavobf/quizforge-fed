import type { Router, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function setupRouterGuards(router: Router) {
  router.beforeEach(
    (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const authStore = useAuthStore()

      const isPublic = ['login', 'register'].includes(to.name as string)
      const isAdmin = (to.meta.requiresAdmin as boolean) === true
      const requiresAuth = (to.meta.requiresAuth as boolean) !== false

      if (!authStore.isAuthenticated && requiresAuth && !isPublic) {
        return next({ name: 'login', query: { redirect: to.fullPath } })
      }

      if (authStore.isAuthenticated && isPublic) {
        return next({ name: 'home' })
      }

      if (isAdmin && !authStore.isAdmin) {
        return next({ name: 'home' })
      }

      next()
    },
  )
}
