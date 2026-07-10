<template>
  <div class="question-import">
    <div class="card">
      <h2>Import Questions</h2>
      <p class="description">Upload an Excel file (.xlsx) to import multiple questions at once.</p>

      <form @submit.prevent="handleImport" class="import-form">
        <div class="form-group">
          <label for="subject">Subject <span class="required">*</span></label>
          <select 
            id="subject" 
            v-model="selectedSubjectId" 
            required
            :disabled="isLoading"
          >
            <option value="">Select a subject...</option>
            <option 
              v-for="subject in subjects" 
              :key="subject.id" 
              :value="subject.id"
            >
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="file">Excel File <span class="required">*</span></label>
          <div 
            class="file-drop-zone"
            :class="{ 
              'dragover': isDragover, 
              'has-file': selectedFile,
              'disabled': isLoading 
            }"
            @dragover.prevent="isDragover = true"
            @dragleave.prevent="isDragover = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
              :disabled="isLoading"
              style="display: none"
            />
            
            <div v-if="!selectedFile" class="drop-content">
              <span class="file-icon">📄</span>
              <p>Drag & drop your Excel file here</p>
              <p class="hint">or click to browse</p>
              <p class="supported">Supported: .xlsx, .xls</p>
            </div>
            
            <div v-else class="file-selected">
              <span class="file-icon">📊</span>
              <div class="file-info">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button 
                type="button" 
                class="remove-file"
                @click.stop="removeFile"
                :disabled="isLoading"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="!isFormValid || isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Importing...' : 'Import Questions' }}
          </button>
          <button 
            type="button" 
            class="btn-secondary"
            @click="resetForm"
            :disabled="isLoading"
          >
            Reset
          </button>
        </div>
      </form>

      <div v-if="importResult" class="import-result" :class="importResult.success ? 'success' : 'error'">
        <div class="result-icon">{{ importResult.success ? '✅' : '❌' }}</div>
        <div class="result-message">
          <p>{{ importResult.message }}</p>
          <p v-if="importResult.count !== undefined" class="result-count">
            {{ importResult.count }} questions imported
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { subjectApi, type Subject } from '@/api/subjectApi'
import { useToast } from '@/composables/useToast'

const { showError, showSuccess } = useToast()

const subjects = ref<Subject[]>([])
const selectedSubjectId = ref<number | string>('')
const selectedFile = ref<File | null>(null)
const isDragover = ref(false)
const isLoading = ref(false)
const importResult = ref<{ success: boolean; message: string; count?: number } | null>(null)

const isFormValid = computed(() => {
  return selectedSubjectId.value && selectedFile.value
})

const emit = defineEmits<{
  (e: 'imported', count: number): void
}>()

async function loadSubjects() {
  try {
    const response = await subjectApi.getAll()
    subjects.value = response.data
  } catch (error) {
    showError('Failed to load subjects')
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
  isDragover.value = false
}

function handleDrop(event: DragEvent) {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      selectedFile.value = file
    } else {
      showError('Please upload a valid Excel file (.xlsx or .xls)')
    }
  }
}

function removeFile() {
  selectedFile.value = null
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
  importResult.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleImport() {
  if (!isFormValid.value) {
    showError('Please select a subject and a file')
    return
  }

  isLoading.value = true
  importResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value!)
    formData.append('subjectId', String(selectedSubjectId.value))

    const response = await fetch('/api/questions/import?' + new URLSearchParams({
      subjectId: String(selectedSubjectId.value)
    }), {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Import failed')
    }

    const data = await response.json()
    const count = data.totalQuestionsImported || data.importedCount || 0

    importResult.value = {
      success: true,
      message: 'Questions imported successfully!',
      count
    }

    showSuccess(`Successfully imported ${count} questions!`)
    emit('imported', count)

    selectedFile.value = null
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) input.value = ''

  } catch (error: any) {
    const message = error.message || 'Failed to import questions'
    importResult.value = {
      success: false,
      message: message
    }
    showError(message)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  selectedSubjectId.value = ''
  selectedFile.value = null
  importResult.value = null
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

onMounted(() => {
  loadSubjects()
})
</script>

<style scoped>
.question-import {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.description {
  color: #6c757d;
  margin-bottom: 24px;
  font-size: 14px;
}

.required {
  color: #dc3545;
}

.import-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-drop-zone:hover:not(.disabled) {
  border-color: #42b883;
  background: #f0faf5;
}

.file-drop-zone.dragover {
  border-color: #42b883;
  background: #e8f5ee;
  transform: scale(1.01);
}

.file-drop-zone.has-file {
  border-color: #42b883;
  background: #f0faf5;
  padding: 20px;
}

.file-drop-zone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.drop-content .file-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.drop-content p {
  margin: 4px 0;
  color: #6c757d;
}

.drop-content .hint {
  font-size: 14px;
  color: #adb5bd;
}

.drop-content .supported {
  font-size: 12px;
  color: #adb5bd;
  margin-top: 8px;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-selected .file-icon {
  font-size: 32px;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-info .file-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.file-info .file-size {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

.remove-file {
  background: none;
  border: none;
  font-size: 24px;
  color: #dc3545;
  cursor: pointer;
  padding: 0 8px;
  transition: transform 0.2s;
}

.remove-file:hover:not(:disabled) {
  transform: scale(1.2);
}

.remove-file:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary {
  background: #42b883;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.import-result {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.import-result.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.import-result.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.import-result .result-icon {
  font-size: 24px;
}

.import-result .result-message p {
  margin: 0;
}

.import-result .result-count {
  font-size: 14px;
  opacity: 0.8;
}
</style>