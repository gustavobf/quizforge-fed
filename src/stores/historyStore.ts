import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { historyApi, type ExamHistory, type ExamHistorySummary } from '@/api/historyApi'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<ExamHistory[]>([])
  const summary = ref<ExamHistorySummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(0)
  const pageSize = ref(20)
  const totalItems = ref(0)

  const hasMore = computed(() => {
    return history.value.length < totalItems.value
  })

  async function loadHistory(page: number = 0, size: number = 20) {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getHistory(page, size)
      if (page === 0) {
        history.value = response.data
      } else {
        history.value = [...history.value, ...response.data]
      }
      currentPage.value = page
      totalItems.value = response.data.length > 0 ? response.data.length : 0
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load history'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadSummary() {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getSummary()
      summary.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load summary'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadBySubject(subjectId: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getBySubject(subjectId)
      history.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load history by subject'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadById(examId: number): Promise<ExamHistory> {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getById(examId)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load exam details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    history.value = []
    summary.value = null
    error.value = null
    currentPage.value = 0
    totalItems.value = 0
  }

  return {
    history,
    summary,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalItems,
    hasMore,
    loadHistory,
    loadSummary,
    loadBySubject,
    loadById,
    reset
  }
})