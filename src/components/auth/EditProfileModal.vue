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
