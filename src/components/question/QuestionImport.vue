<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { subjectApi } from '@/api/subjectApi'
import { questionApi } from '@/api/questionApi'

const { showError, showSuccess } = useToast()
const subjects = ref([])
const selectedSubjectId = ref('')
const selectedFile = ref(null)
const isDragging = ref(false)
const isLoading = ref(false)
const importResult = ref(null)
const fileInputRef = ref(null)

const emit = defineEmits(['imported'])

const isFormValid = computed(() => selectedSubjectId.value && selectedFile.value)

async function loadSubjects() {
  try {
    const response = await subjectApi.getAll()
    subjects.value = response.data
  } catch (error) {
    showError('Failed to load subjects')
  }
}

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (file) {
    if (validateFile(file)) {
      selectedFile.value = file
    } else {
      showError('Please upload a valid Excel file (.xlsx or .xls)')
      resetFileInput()
    }
  }
  isDragging.value = false
}

function validateFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
  const validExtensions = ['.xlsx', '.xls']
  const fileExtension = '.' + file.name.split('.').pop()
  
  return validTypes.includes(file.type) || validExtensions.includes(fileExtension)
}

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event) {
  event.preventDefault()
  isDragging.value = false
}

function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (validateFile(file)) {
      selectedFile.value = file
    } else {
      showError('Please upload a valid Excel file (.xlsx or .xls)')
    }
  }
}

function removeFile() {
  selectedFile.value = null
  importResult.value = null
  resetFileInput()
}

function resetFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function importQuestions() {
  if (!isFormValid.value) {
    showError('Please select a subject and a file')
    return
  }

  isLoading.value = true
  importResult.value = null

  try {
    const response = await questionApi.importQuestions(
      selectedFile.value,
      Number(selectedSubjectId.value)
    )

    const data = response.data
    const count = data.totalQuestionsImported || 0
    
    importResult.value = {
      success: true,
      message: 'Questions imported successfully!',
      count: count
    }
    
    showSuccess(`Successfully imported ${count} questions!`)
    emit('imported', count)
    
    selectedFile.value = null
    resetFileInput()
    
  } catch (error) {
    let errorMessage = 'Failed to import questions'
    
    if (error.response) {
      const errorData = error.response.data
      errorMessage = errorData.message || errorData.error || errorData.details || errorMessage
      
      if (error.response.status === 400) {
        errorMessage = 'Invalid request. Please check the file format.'
      } else if (error.response.status === 413) {
        errorMessage = 'File is too large. Maximum size is 10MB.'
      } else if (error.response.status === 502) {
        errorMessage = 'Backend service is unavailable. Please try again later.'
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.'
    } else {
      errorMessage = error.message || errorMessage
    }
    
    importResult.value = {
      success: false,
      message: errorMessage
    }
    showError(errorMessage)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  selectedSubjectId.value = ''
  selectedFile.value = null
  importResult.value = null
  resetFileInput()
}

onMounted(() => {
  loadSubjects()
})
</script>

<template>
  <div class="question-import">
    <div class="card">
      <h2>Import Questions</h2>
      <p class="description">
        Upload an Excel file (.xlsx) to import multiple questions at once.
      </p>

      <form @submit.prevent="importQuestions" class="import-form">
        <div class="form-group">
          <label for="subject">
            Subject <span class="required">*</span>
          </label>
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
          <label for="file">
            Excel File <span class="required">*</span>
          </label>
          <div
            class="file-drop-zone"
            :class="{
              dragover: isDragging,
              'has-file': selectedFile,
              disabled: isLoading
            }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="fileInputRef?.click()"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileUpload"
              :disabled="isLoading"
              style="display: none"
            />

            <div v-if="selectedFile" class="file-selected">
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

            <div v-else class="drop-content">
              <span class="file-icon">📄</span>
              <p>Drag & drop your Excel file here</p>
              <p class="hint">or click to browse</p>
              <p class="supported">Supported: .xlsx, .xls</p>
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

        <div
          v-if="importResult"
          class="import-result"
          :class="importResult.success ? 'success' : 'error'"
        >
          <div class="result-icon">{{ importResult.success ? '✅' : '❌' }}</div>
          <div class="result-message">
            <p>{{ importResult.message }}</p>
            <p v-if="importResult.count !== undefined" class="result-count">
              {{ importResult.count }} questions imported
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.question-import {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.import-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.file-drop-zone {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-drop-zone:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.file-drop-zone.dragover {
  border-color: #3498db;
  background: #e8f4f8;
}

.file-drop-zone.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
}

.hint {
  color: #999;
  font-size: 14px;
}

.supported {
  color: #666;
  font-size: 12px;
  margin-top: 8px;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 10px;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  margin: 0;
}

.file-size {
  color: #666;
  font-size: 14px;
  margin: 4px 0 0;
}

.remove-file {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #e74c3c;
  padding: 0 8px;
}

.remove-file:hover {
  color: #c0392b;
}

.remove-file:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.import-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
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

.result-icon {
  font-size: 24px;
}

.result-message {
  flex: 1;
}

.result-message p {
  margin: 0;
}

.result-count {
  font-weight: 500;
  margin-top: 4px !important;
}
</style>