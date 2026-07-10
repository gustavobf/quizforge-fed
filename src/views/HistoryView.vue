<template>
  <div class="history-view">
    <div class="history-header">
      <h1>📊 Exam History</h1>
      <p class="subtitle">View your past exam results and performance</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="isLoading && !summary" class="loading">
      Loading...
    </div>

    <template v-else>
      <HistorySummary :summary="summary" />

      <div class="history-section">
        <h2>All Exams</h2>
        <HistoryList
          :history="history"
          :isLoading="isLoading"
          :hasMore="hasMore"
          @loadMore="loadMore"
        />
      </div>
    </template>

    <ExamDetailModal
      :visible="showModal"
      :examId="selectedExamId"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import { storeToRefs } from 'pinia'
import HistorySummary from '@/components/history/HistorySummary.vue'
import HistoryList from '@/components/history/HistoryList.vue'
import ExamDetailModal from '@/components/history/ExamDetailModal.vue'

const historyStore = useHistoryStore()
const { history, summary, isLoading, error, hasMore } = storeToRefs(historyStore)
const { loadHistory, loadSummary, reset } = historyStore

const showModal = ref(false)
const selectedExamId = ref<number | null>(null)

function loadMore() {
  loadHistory(historyStore.currentPage + 1, historyStore.pageSize)
}

function closeModal() {
  showModal.value = false
  selectedExamId.value = null
}

onMounted(async () => {
  reset()
  await Promise.all([
    loadHistory(0, 20),
    loadSummary()
  ])
})
</script>

<style scoped>
.history-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

.history-header {
  margin-bottom: 30px;
}

.history-header h1 {
  color: #2c3e50;
  margin-bottom: 4px;
}

.subtitle {
  color: #6c757d;
}

.history-section {
  margin-top: 30px;
}

.history-section h2 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 20px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
</style>