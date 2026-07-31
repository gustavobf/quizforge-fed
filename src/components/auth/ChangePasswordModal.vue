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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

h2 {
  margin-bottom: 30px;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-text);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  box-sizing: border-box;
  transition: all var(--transition);
  background: var(--color-bg);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.error-text {
  color: var(--color-danger);
  font-size: 13px;
  margin-top: 8px;
  display: block;
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

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.modal-actions button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all var(--transition);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: linear-gradient(135deg, var(--color-border-light), var(--color-bg));
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
