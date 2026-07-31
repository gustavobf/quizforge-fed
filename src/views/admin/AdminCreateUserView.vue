<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>Create New User</h1>
      <RouterLink to="/admin/users" class="btn-secondary">← Back to Users</RouterLink>
    </div>

    <div class="create-user-card">
      <form @submit.prevent="handleCreateUser">
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
            placeholder="user@email.com"
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
            placeholder="Enter password"
            required
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          <div class="password-requirements">
            <p :class="{ valid: hasMinLength }">✓ At least 8 characters</p>
            <p :class="{ valid: hasUppercase }">✓ At least 1 uppercase</p>
            <p :class="{ valid: hasLowercase }">✓ At least 1 lowercase</p>
            <p :class="{ valid: hasNumber }">✓ At least 1 number</p>
            <p :class="{ valid: hasSpecial }">✓ At least 1 special character</p>
          </div>
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="role" required>
            <option value="">Select a role</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <span v-if="errors.role" class="error-text">{{ errors.role }}</span>
        </div>

        <div v-if="apiError" class="error-box">
          {{ apiError }}
        </div>

        <div class="form-actions">
          <RouterLink to="/admin/users" class="btn-secondary">Cancel</RouterLink>
          <button type="submit" class="btn-primary" :disabled="isLoading || !isPasswordValid">
            {{ isLoading ? 'Creating...' : 'Create User' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { authService } from '@/services/authService'
import type { CreateUserRequest, Role } from '@/types/auth.types'

const router = useRouter()
const { showSuccess, showError } = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<Role | ''>('')
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

  if (!role.value) {
    errors.value.role = 'Role is required'
  }

  return Object.keys(errors.value).length === 0
}

async function handleCreateUser() {
  if (!validateForm()) return

  isLoading.value = true
  apiError.value = ''

  try {
    const userData: CreateUserRequest = {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value as Role,
    }
    await authService.adminCreateUser(userData)
    showSuccess('User created successfully')
    router.push('/admin/users')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; validationErrors?: Record<string, string> } } }
    if (err?.response?.data?.validationErrors) {
      errors.value = err.response.data.validationErrors
    } else {
      apiError.value = err?.response?.data?.message || 'Failed to create user'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: var(--color-text);
  margin: 0;
}

.btn-secondary {
  padding: 10px 15px;
  background: #f0f0f0;
  color: var(--color-text);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.create-user-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
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
}

input,
select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.error-text {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
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
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid var(--color-danger);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.form-actions a,
.form-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: background 0.3s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: var(--color-text);
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
