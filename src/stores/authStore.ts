import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import type { AuthUserResponse, Role, LoginRequest, RegisterRequest, ChangePasswordRequest, CreateUserRequest } from '@/types/auth.types'
import { useToast } from '@/composables/useToast'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUserResponse | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const expiresIn = ref<number | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const userName = computed(() => user.value?.name || '')

  function restoreFromStorage() {
    const storedUser = localStorage.getItem('user')
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedExpiresIn = localStorage.getItem('expiresIn')

    if (storedUser && storedAccessToken) {
      user.value = JSON.parse(storedUser)
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      expiresIn.value = storedExpiresIn ? Number(storedExpiresIn) : null
      return true
    }
    return false
  }

  function saveToStorage() {
    if (user.value && accessToken.value && refreshToken.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('accessToken', accessToken.value)
      localStorage.setItem('refreshToken', refreshToken.value)
      if (expiresIn.value) {
        localStorage.setItem('expiresIn', String(expiresIn.value))
      }
    }
  }

  function clearStorage() {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresIn')
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresIn.value = null
  }

  async function login(credentials: LoginRequest) {
    const { showError } = useToast()
    isLoading.value = true
    try {
      const response = await authService.login(credentials)
      user.value = response.data.user
      accessToken.value = response.data.token.accessToken
      refreshToken.value = response.data.token.refreshToken
      expiresIn.value = response.data.token.expiresIn
      saveToStorage()
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err?.response?.data?.message || 'Login failed'
      showError(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    const { showError } = useToast()
    isLoading.value = true
    try {
      const response = await authService.register(data)
      user.value = response.data.user
      accessToken.value = response.data.token.accessToken
      refreshToken.value = response.data.token.refreshToken
      expiresIn.value = response.data.token.expiresIn
      saveToStorage()
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err?.response?.data?.message || 'Registration failed'
      showError(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    const { showSuccess } = useToast()
    isLoading.value = true
    try {
      await authService.logout()
      showSuccess('Logged out successfully')
    } catch {
      // Continue logout even if API call fails
    } finally {
      clearStorage()
      isLoading.value = false
    }
  }

  async function changePassword(data: ChangePasswordRequest) {
    const { showSuccess, showError } = useToast()
    isLoading.value = true
    try {
      await authService.changePassword(data)
      showSuccess('Password changed successfully')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err?.response?.data?.message || 'Failed to change password'
      showError(message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAccount() {
    const { showSuccess } = useToast()
    isLoading.value = true
    try {
      await authService.deleteProfile()
      showSuccess('Account deleted')
      clearStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function loadProfile() {
    isLoading.value = true
    try {
      const response = await authService.getProfile()
      user.value = response.data
      saveToStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: { name?: string; email?: string }) {
    const { showSuccess, showError } = useToast()
    isLoading.value = true
    try {
      const response = await authService.updateProfile(data)
      user.value = response.data
      saveToStorage()
      showSuccess('Profile updated successfully')
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } }
      const status = err?.response?.status
      const message = err?.response?.data?.message || 'Failed to update profile'

      if (status === 409) {
        showError('Email already in use by another user')
      } else {
        showError(message)
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    expiresIn,
    isLoading,
    isAuthenticated,
    isAdmin,
    userName,
    restoreFromStorage,
    clearStorage,
    login,
    register,
    logout,
    changePassword,
    deleteAccount,
    updateProfile,
    loadProfile,
  }
})
