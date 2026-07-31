<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Edit Profile</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Enter your full name"
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
            placeholder="Enter your email"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div v-if="apiError" class="error-box">
          {{ apiError }}
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isLoading || (!name && !email)">
            {{ isLoading ? 'Updating...' : 'Update Profile' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const isLoading = ref(false)
const apiError = ref('')
const errors = ref<Record<string, string>>({})

const currentUser = computed(() => authStore.user)

watch(
  () => authStore.user,
  () => {
    if (currentUser.value) {
      name.value = currentUser.value.name
      email.value = currentUser.value.email
    }
  },
  { immediate: true },
)

function validateForm(): boolean {
  errors.value = {}

  if (name.value && name.value.trim().length < 1) {
    errors.value.name = 'Name cannot be empty'
  }

  if (email.value && !isValidEmail(email.value)) {
    errors.value.email = 'Please enter a valid email'
  }

  return Object.keys(errors.value).length === 0
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleSubmit() {
  if (!validateForm()) return

  if (!name.value && !email.value) {
    errors.value.name = 'Please update at least one field'
    return
  }

  isLoading.value = true
  apiError.value = ''

  try {
    const updateData: { name?: string; email?: string } = {}
    if (name.value !== currentUser.value?.name) {
      updateData.name = name.value
    }
    if (email.value !== currentUser.value?.email) {
      updateData.email = email.value
    }

    if (Object.keys(updateData).length === 0) {
      emit('close')
      return
    }

    await authStore.updateProfile(updateData)
    emit('close')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    apiError.value = err?.response?.data?.message || 'Failed to update profile'
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
