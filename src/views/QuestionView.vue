<template>
  <div class="questions">
    <div class="header">
      <h1>Question Management</h1>
      <button @click="downloadTemplate" :disabled="isDownloading" class="btn-download">
        {{ isDownloading ? 'Downloading...' : '📥 Download Template' }}
      </button>
    </div>
    <QuestionImport @imported="onImportSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QuestionImport from '@/components/question/QuestionImport.vue'
import { templateApi } from '@/api/templateApi'
import { useToast } from '@/composables/useToast'

const { showSuccess, showError } = useToast()
const isDownloading = ref(false)

function onImportSuccess(count: number) {
  console.log(`Imported ${count} questions`)
}

async function downloadTemplate() {
  if (isDownloading.value) return
  
  isDownloading.value = true
  try {
    const response = await templateApi.downloadTemplate()
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'questions-template.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    showSuccess('Template downloaded successfully!')
  } catch (error: any) {
    console.error('Error downloading template:', error)
    showError('Failed to download template')
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.questions {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.questions h1 {
  margin-bottom: 0;
  color: #2c3e50;
}

.btn-download {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-download:hover:not(:disabled) {
  background: #1565c0;
}

.btn-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>