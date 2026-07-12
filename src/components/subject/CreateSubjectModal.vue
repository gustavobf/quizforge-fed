<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Edit Subject' : 'New Subject' }}</h2>
        <button @click="close" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group" :class="{ 'has-error': hasError('name') }">
          <label for="name">Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Enter subject name..."
            required
            maxlength="100"
            @input="clearError('name')"
          />
          <small class="char-count">{{ formData.name.length }}/100</small>
          <div v-if="getError('name')" class="error-message">
            {{ getError('name') }}
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': hasError('description') }">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter subject description (optional)..."
            rows="4"
            maxlength="500"
            @input="clearError('description')"
          />
          <small class="char-count">{{ formData.description.length }}/500</small>
          <div v-if="getError('description')" class="error-message">
            {{ getError('description') }}
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="close" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="isLoading || subjectStore.isLoading" class="btn-primary">
            {{ isLoading || subjectStore.isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSubjectStore } from '@/stores/subjectStore'

const props = defineProps<{
  isOpen: boolean
  editingSubject?: {
    id: number
    name: string
    description: string | null
  } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const subjectStore = useSubjectStore()
const isLoading = ref(false)

const isEditing = computed(() => !!props.editingSubject)

const formData = ref({
  name: '',
  description: ''
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.editingSubject) {
      formData.value = {
        name: props.editingSubject.name,
        description: props.editingSubject.description || ''
      }
    } else if (newVal) {
      formData.value = {
        name: '',
        description: ''
      }
    }
    subjectStore.clearValidationErrors()
  },
  { immediate: true }
)

function hasError(field: string): boolean {
  return !!subjectStore.validationErrors[field]
}

function getError(field: string): string | null {
  return subjectStore.validationErrors[field] || null
}

function clearError(field: string) {
  const errors = { ...subjectStore.validationErrors }
  delete errors[field]
}

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    subjectStore.validationErrors = { name: 'Name is required' }
    return
  }

  if (formData.value.name.length < 3) {
    subjectStore.validationErrors = { name: 'Name must be at least 3 characters' }
    return
  }

  isLoading.value = true
  try {
    if (isEditing.value && props.editingSubject) {
      await subjectStore.updateSubject(props.editingSubject.id, {
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || undefined
      })
    } else {
      await subjectStore.createSubject({
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || undefined
      })
    }
    emit('success')
    close()
  } catch (error) {
    if (Object.keys(subjectStore.validationErrors).length > 0) {
      return
    }
    close()
  } finally {
    isLoading.value = false
  }
}

function close() {
  subjectStore.clearValidationErrors()
  emit('close')
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

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0 8px;
}

.close-btn:hover {
  color: #dc3545;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.has-error input,
.form-group.has-error textarea {
  border-color: #dc3545;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6c757d;
  text-align: right;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #d0d0d0;
}
</style>