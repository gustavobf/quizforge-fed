<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Register</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="John Doe"
            required
            maxlength="120"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

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
            placeholder="Enter strong password"
            required
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          <div class="password-requirements">
            <p :class="{ valid: hasMinLength }">✓ At least 8 characters</p>
            <p :class="{ valid: hasUppercase }">✓ At least 1 uppercase letter</p>
            <p :class="{ valid: hasLowercase }">✓ At least 1 lowercase letter</p>
            <p :class="{ valid: hasNumber }">✓ At least 1 number</p>
            <p :class="{ valid: hasSpecial }">✓ At least 1 special character</p>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="apiError" class="error-box">
          {{ apiError }}
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading || !isPasswordValid">
          {{ isLoading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="auth-link">
        Already have an account?
        <RouterLink to="/login">Login here</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import type { RegisterRequest } from '@/types/auth.types'

const router = useRouter()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const apiError = ref('')
const errors = ref<Record<string, string>>({})

const hasMinLength = computed(() => password.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(password.value))
const hasLowercase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /[0-9]/.test(password.value))
const hasSpecial = computed(() => /[@#$%&!*]/.test(password.value))
const isPasswordValid = computed(
  () => hasMinLength.value && hasUppercase.value && hasLowercase.value && hasNumber.value && hasSpecial.value,
)

function validateForm(): boolean {
  errors.value = {}

  if (!name.value.trim()) {
    errors.value.name = 'Full name is required'
  }

  if (!email.value.trim()) {
    errors.value.email = 'Email is required'
  }

  if (!isPasswordValid.value) {
    errors.value.password = 'Password does not meet requirements'
  }

  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

async function handleRegister() {
  if (!validateForm()) return

  isLoading.value = true
  apiError.value = ''

  try {
    const registerData: RegisterRequest = {
      name: name.value,
      email: email.value,
      password: password.value,
    }
    await authStore.register(registerData)
    showSuccess('Account created successfully')
    router.push('/')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; validationErrors?: Record<string, string> } } }
    if (err?.response?.data?.validationErrors) {
      errors.value = err.response.data.validationErrors
    } else {
      apiError.value = err?.response?.data?.message || 'Registration failed. Please try again.'
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
  overflow-y: auto;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 50px;
  width: 100%;
  max-width: 480px;
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

.password-requirements {
  font-size: 12px;
  margin-top: 8px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.password-requirements p {
  margin: 4px 0;
  color: var(--color-text-secondary);
}

.password-requirements p.valid {
  color: var(--color-success);
}

.error-box {
  background: #ffebee;
  color: var(--color-danger);
  padding: 14px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 5px solid var(--color-danger);
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
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
