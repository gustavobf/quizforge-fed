<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Change Password</h2>

      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            v-model="currentPassword"
            type="password"
            placeholder="Enter current password"
            required
          />
          <span v-if="errors.currentPassword" class="error-text">{{ errors.currentPassword }}</span>
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            required
          />
          <span v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</span>
          <div class="password-requirements">
            <p :class="{ valid: hasMinLength }">✓ At least 8 characters</p>
            <p :class="{ valid: hasUppercase }">✓ At least 1 uppercase</p>
            <p :class="{ valid: hasLowercase }">✓ At least 1 lowercase</p>
            <p :class="{ valid: hasNumber }">✓ At least 1 number</p>
            <p :class="{ valid: hasSpecial }">✓ At least 1 special char</p>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="apiError" class="error-box">
          {{ apiError }}
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isLoading || !isPasswordValid">
            {{ isLoading ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import type { ChangePasswordRequest } from '@/types/auth.types'

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const { showSuccess } = useToast()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const apiError = ref('')
const errors = ref<Record<string, string>>({})

const hasMinLength = computed(() => newPassword.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value))
const hasLowercase = computed(() => /[a-z]/.test(newPassword.value))
const hasNumber = computed(() => /[0-9]/.test(newPassword.value))
const hasSpecial = computed(() => /[@#$%&!*]/.test(newPassword.value))
const isPasswordValid = computed(
  () => hasMinLength.value && hasUppercase.value && hasLowercase.value && hasNumber.value && hasSpecial.value,
)

function validateForm(): boolean {
  errors.value = {}

  if (!currentPassword.value) {
    errors.value.currentPassword = 'Current password is required'
  }

  if (!isPasswordValid.value) {
    errors.value.newPassword = 'New password does not meet requirements'
  }

  if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  if (newPassword.value === currentPassword.value) {
    errors.value.newPassword = 'New password must be different from current password'
  }

  return Object.keys(errors.value).length === 0
}

async function handleChangePassword() {
  if (!validateForm()) return

  isLoading.value = true
  apiError.value = ''

  try {
    const data: ChangePasswordRequest = {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    }
    await authStore.changePassword(data)
    showSuccess('Password changed successfully')
    emit('close')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; validationErrors?: Record<string, string> } } }
    if (err?.response?.data?.validationErrors) {
      errors.value = err.response.data.validationErrors
    } else {
      apiError.value = err?.response?.data?.message || 'Failed to change password'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

h2 {
  margin-bottom: 25px;
  color: var(--color-text);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text);
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.error-text {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
  display: block;
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

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
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
