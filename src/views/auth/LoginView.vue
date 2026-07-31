<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div v-if="apiError" class="error-box">
          {{ apiError }}
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="auth-link">
        Don't have an account?
        <RouterLink to="/register">Register here</RouterLink>
      </p>

      <div class="demo-credentials">
        <p><strong>Demo Users:</strong></p>
        <p>Admin: admin@quizforge.local / Admin@123</p>
        <p>User: user@quizforge.local / User@123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import type { LoginRequest } from '@/types/auth.types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const apiError = ref('')
const errors = ref<Record<string, string>>({})

async function handleLogin() {
  errors.value = {}
  apiError.value = ''

  if (!email.value || !password.value) {
    errors.value.email = !email.value ? 'Email is required' : ''
    errors.value.password = !password.value ? 'Password is required' : ''
    return
  }

  isLoading.value = true
  try {
    const credentials: LoginRequest = {
      email: email.value,
      password: password.value,
    }
    await authStore.login(credentials)
    showSuccess('Login successful')

    const redirect = route.query.redirect as string
    setTimeout(() => {
      router.push(redirect || '/')
    }, 1000)
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; validationErrors?: Record<string, string> } } }
    if (err?.response?.data?.validationErrors) {
      errors.value = err.response.data.validationErrors
    } else {
      apiError.value = err?.response?.data?.message || 'Login failed. Please try again.'
      showError(apiError.value, 6000)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
  padding: 20px;
  min-height: 100vh;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 50px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(10px);
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-text);
  font-size: 32px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 15px;
}

input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.3s;
  background: #f9f9f9;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
}

.error-text {
  color: var(--color-danger);
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
}

.error-box {
  background: #ffebee;
  color: var(--color-danger);
  padding: 14px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 5px solid var(--color-danger);
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-primary {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  font-size: 15px;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-link {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 30px;
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
}

.demo-credentials {
  margin-top: 0;
  padding: 20px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%);
  border: 2px solid rgba(25, 118, 210, 0.2);
  border-radius: 8px;
  font-size: 13px;
}

.demo-credentials p {
  margin: 8px 0;
  color: var(--color-text);
  line-height: 1.6;
}

.demo-credentials strong {
  color: var(--color-primary);
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.demo-credentials p:first-child {
  margin-top: 0;
}
</style>
