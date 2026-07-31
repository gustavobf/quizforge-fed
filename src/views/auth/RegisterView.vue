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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  padding: 20px;
  min-height: 100vh;
  overflow-y: auto;
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
  max-width: 480px;
  position: relative;
  z-index: 1;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-text);
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.password-requirements {
  font-size: 12px;
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius-md);
}

.password-requirements p {
  margin: 6px 0;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-requirements p.valid {
  color: var(--color-success);
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
}

.auth-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  color: var(--color-secondary);
}
</style>
