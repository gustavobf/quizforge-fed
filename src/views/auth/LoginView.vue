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
        <div class="demo-header">
          <span>📋 Demo Users</span>
        </div>
        
        <div class="credential-item">
          <div class="credential-content">
            <span class="credential-label">Admin Account</span>
            <span class="credential-value">admin@quizforge.local</span>
            <span class="credential-value">Admin@123</span>
          </div>
          <div class="credential-actions">
            <button @click="copyCred('admin@quizforge.local')" type="button" class="copy-btn" title="Copy email">📧</button>
            <button @click="copyCred('Admin@123')" type="button" class="copy-btn" title="Copy password">🔑</button>
          </div>
        </div>

        <div class="credential-item">
          <div class="credential-content">
            <span class="credential-label">User Account</span>
            <span class="credential-value">user@quizforge.local</span>
            <span class="credential-value">User@123</span>
          </div>
          <div class="credential-actions">
            <button @click="copyCred('user@quizforge.local')" type="button" class="copy-btn" title="Copy email">📧</button>
            <button @click="copyCred('User@123')" type="button" class="copy-btn" title="Copy password">🔑</button>
          </div>
        </div>
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

async function copyCred(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    showSuccess('Copied to clipboard!')
  } catch {
    showError('Failed to copy')
  }
}

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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  padding: 80px 20px;
  min-height: 100vh;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1), transparent),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 50px;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-text);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  padding: 14px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  transition: all var(--transition);
  background: var(--color-bg);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.error-text {
  color: var(--color-danger);
  font-size: 13px;
  margin-top: 8px;
  font-weight: 500;
}

.error-box {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: var(--color-danger);
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  font-size: 14px;
  border-left: 4px solid var(--color-danger);
  font-weight: 500;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  margin-bottom: 24px;
  font-size: 15px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  color: var(--color-text-light);
  font-size: 14px;
  margin-bottom: 32px;
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  color: var(--color-secondary);
}

.demo-credentials {
  padding: 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05));
  border: 2px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-header {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.credential-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all var(--transition);
}

.credential-item:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.credential-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.credential-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.credential-value {
  font-size: 13px;
  color: var(--color-text);
  font-family: 'Courier New', monospace;
  font-weight: 500;
  word-break: break-all;
}

.credential-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  cursor: pointer;
  font-size: 18px;
  transition: all var(--transition);
  padding: 0;
}

.copy-btn:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  transform: scale(1.1);
}

.copy-btn:active {
  transform: scale(0.95);
}
</style>
