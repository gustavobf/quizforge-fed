import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subjectApi, type Subject, type CreateSubjectRequest } from '@/api/subjectApi'
import { useToast } from '@/composables/useToast'

export const useSubjectStore = defineStore('subject', () => {
  const subjects = ref<Subject[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string>>({})
  const { showError, showSuccess } = useToast()

  async function loadSubjects() {
    isLoading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      const response = await subjectApi.getAll()
      subjects.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load subjects'
      showError(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function createSubject(data: CreateSubjectRequest) {
    isLoading.value = true
    error.value = null
    validationErrors.value = {}
    
    try {
      const response = await subjectApi.create(data)
      subjects.value.push(response.data)
      showSuccess('Subject created successfully!')
      return response.data
    } catch (err: any) {
      const errorData = err.response?.data
      
      if (err.response?.status === 400 && errorData?.validationErrors) {
        validationErrors.value = errorData.validationErrors
        
        const firstError = Object.values(errorData.validationErrors)[0]
        if (firstError) {
          showError(firstError as string)
        } else {
          showError(errorData.message || 'Validation failed')
        }
      } else {
        error.value = errorData?.message || 'Failed to create subject'
        showError(error.value)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateSubject(id: number, data: CreateSubjectRequest) {
    isLoading.value = true
    error.value = null
    validationErrors.value = {}
    
    try {
      const response = await subjectApi.update(id, data)
      const index = subjects.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subjects.value[index] = response.data
      }
      showSuccess('Subject updated successfully!')
      return response.data
    } catch (err: any) {
      const errorData = err.response?.data
      
      if (err.response?.status === 400 && errorData?.validationErrors) {
        validationErrors.value = errorData.validationErrors
        const firstError = Object.values(errorData.validationErrors)[0]
        if (firstError) {
          showError(firstError as string)
        }
      } else {
        error.value = errorData?.message || 'Failed to update subject'
        showError(error.value)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSubject(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await subjectApi.delete(id)
      subjects.value = subjects.value.filter(s => s.id !== id)
      showSuccess('Subject deleted successfully!')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete subject'
      showError(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearValidationErrors() {
    validationErrors.value = {}
  }

  function reset() {
    subjects.value = []
    isLoading.value = false
    error.value = null
    validationErrors.value = {}
  }

  return {
    subjects,
    isLoading,
    error,
    validationErrors,
    loadSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    clearValidationErrors,
    reset
  }
})