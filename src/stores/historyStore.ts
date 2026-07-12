import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { historyApi, type HistorySummary, type HistoryExam, type HistoryExamDetail, type SubjectStats, type PageResponse } from '@/api/historyApi'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryExam[]>([])
  const summary = ref<HistorySummary | null>(null)
  const subjectStats = ref<SubjectStats[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const sortBy = ref('finishedAt')
  const sortDirection = ref('desc')

  const hasMore = computed(() => {
    return history.value.length < totalElements.value
  })

  const isEmpty = computed(() => {
    return !isLoading.value && history.value.length === 0 && !error.value
  })

  async function loadExams(page: number = 0, size: number = 10, sortByField?: string, sortDir?: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getExams(
        page, 
        size, 
        sortByField || sortBy.value, 
        sortDir || sortDirection.value
      )
      
      const data = response.data
      
      if (page === 0) {
        history.value = data.content
      } else {
        history.value = [...history.value, ...data.content]
      }
      
      currentPage.value = page
      pageSize.value = size
      totalElements.value = data.totalElements
      totalPages.value = data.totalPages
      
      if (sortByField) sortBy.value = sortByField
      if (sortDir) sortDirection.value = sortDir
      
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

  async function loadSubjectStats() {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getSubjectStats()
      subjectStats.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load subject statistics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadExamDetail(examId: number): Promise<HistoryExamDetail> {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyApi.getExamDetail(examId)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load exam details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoading.value) return
    await loadExams(currentPage.value + 1, pageSize.value)
  }

  async function refresh() {
    history.value = []
    await loadExams(0, pageSize.value)
    await loadSummary()
  }

  function reset() {
    history.value = []
    summary.value = null
    subjectStats.value = []
    error.value = null
    currentPage.value = 0
    totalElements.value = 0
    totalPages.value = 0
    isLoading.value = false
  }

  function setSort(sortByField: string, sortDir: string) {
    sortBy.value = sortByField
    sortDirection.value = sortDir
    loadExams(0, pageSize.value, sortByField, sortDir)
  }

  return {
    history,
    summary,
    subjectStats,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    sortBy,
    sortDirection,
    
    hasMore,
    isEmpty,
    
    loadExams,
    loadSummary,
    loadSubjectStats,
    loadExamDetail,
    loadMore,
    refresh,
    reset,
    setSort
  }
})