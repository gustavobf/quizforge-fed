<template>
  <div class="history-view">
    <div class="history-header">
      <h1>📊 Exam History</h1>
      <p class="subtitle">View your past exam results and performance</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="refresh" class="btn-retry">Retry</button>
    </div>

    <div v-if="isLoading && !summary" class="loading">
      <div class="spinner"></div>
      <p>Loading history...</p>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <span class="card-value">{{ summary?.totalExams || 0 }}</span>
          <span class="card-label">Total Exams</span>
        </div>
        <div class="summary-card">
          <span class="card-value">{{ summary?.totalQuestionsAnswered || 0 }}</span>
          <span class="card-label">Questions Answered</span>
        </div>
        <div class="summary-card">
          <span class="card-value">{{ summary?.averageScore?.toFixed(1) || 0 }}%</span>
          <span class="card-label">Average Score</span>
        </div>
        <div class="summary-card">
          <span class="card-value">{{ summary?.bestScore?.toFixed(1) || 0 }}%</span>
          <span class="card-label">Best Score</span>
        </div>
        <div class="summary-card">
          <span class="card-value">{{ summary?.worstScore?.toFixed(1) || 0 }}%</span>
          <span class="card-label">Worst Score</span>
        </div>
      </div>

      <!-- Recent Exams -->
      <div v-if="summary?.recentExams?.length" class="recent-exams">
        <h2>Recent Exams</h2>
        <div class="recent-list">
          <div
            v-for="exam in summary.recentExams"
            :key="exam.id"
            class="recent-item"
            @click="openDetail(exam.id)"
          >
            <div class="recent-info">
              <span class="recent-title">{{ exam.title }}</span>
              <span class="recent-subject">{{ exam.subjectName || 'No Subject' }}</span>
              <span class="recent-date">{{ formatDate(exam.finishedAt) }}</span>
            </div>
            <div class="recent-score">
              <span class="score-value" :class="getScoreClass(exam.score)">
                {{ exam.score?.toFixed(1) }}%
              </span>
              <span class="score-detail">
                {{ exam.correctAnswers }}/{{ exam.totalQuestions }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- All Exams -->
      <div class="history-section">
        <div class="section-header">
          <h2>All Exams</h2>
          <div class="sort-controls">
            <label>Sort by:</label>
            <select v-model="sortByField" @change="applySort">
              <option value="finishedAt">Date</option>
              <option value="score">Score</option>
              <option value="title">Title</option>
              <option value="totalQuestions">Questions</option>
            </select>
            <select v-model="sortDir" @change="applySort">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div v-if="history.length === 0 && !isLoading" class="empty">
          <span class="empty-icon">📭</span>
          <p>No exams completed yet</p>
          <router-link to="/" class="btn-primary">Start an Exam</router-link>
        </div>

        <div v-else class="exam-list">
          <div
            v-for="exam in history"
            :key="exam.examId"
            class="exam-item"
            @click="openDetail(exam.examId)"
          >
            <div class="exam-info">
              <span class="exam-title">{{ exam.title }}</span>
              <span class="exam-subject">{{ exam.subjectName || 'No Subject' }}</span>
              <span class="exam-date">{{ formatDate(exam.finishedAt) }}</span>
            </div>
            <div class="exam-stats">
              <span class="stat">{{ exam.totalQuestions }} questions</span>
              <span class="stat">✅ {{ exam.correctAnswers }}</span>
              <span class="stat">❌ {{ exam.wrongAnswers }}</span>
              <span class="stat">⏱️ {{ exam.timeSpentInMinutes }} min</span>
            </div>
            <div class="exam-score">
              <span class="score-value" :class="getScoreClass(exam.score)">
                {{ exam.score?.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="load-more">
          <button @click="loadMore" :disabled="isLoading" class="btn-secondary">
            {{ isLoading ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Exam Detail Modal -->
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
import ExamDetailModal from '@/components/history/ExamDetailModal.vue'

const historyStore = useHistoryStore()
const { history, summary, isLoading, error, hasMore } = storeToRefs(historyStore)
const { loadExams, loadSummary, loadMore, refresh, setSort } = historyStore

const showModal = ref(false)
const selectedExamId = ref<number | null>(null)
const sortByField = ref('finishedAt')
const sortDir = ref('desc')

function applySort() {
  setSort(sortByField.value, sortDir.value)
}

function openDetail(examId: number) {
  selectedExamId.value = examId
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedExamId.value = null
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-medium'
  return 'score-low'
}

onMounted(async () => {
  historyStore.reset()
  await Promise.all([
    loadExams(0, 10),
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

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-retry {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: #c82333;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.card-label {
  font-size: 12px;
  color: #6c757d;
}

.recent-exams {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.recent-exams h2 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 18px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.recent-item:hover {
  background: #f8f9fa;
}

.recent-info {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.recent-title {
  font-weight: 600;
  color: #2c3e50;
}

.recent-subject {
  font-size: 13px;
  color: #6c757d;
}

.recent-date {
  font-size: 12px;
  color: #adb5bd;
}

.recent-score {
  text-align: right;
}

.history-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 18px;
  margin: 0;
}

.sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-controls label {
  font-size: 13px;
  color: #6c757d;
}

.sort-controls select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.exam-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  flex-wrap: wrap;
  gap: 8px;
}

.exam-item:hover {
  background: #f8f9fa;
}

.exam-info {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

.exam-title {
  font-weight: 600;
  color: #2c3e50;
}

.exam-subject {
  font-size: 13px;
  color: #6c757d;
}

.exam-date {
  font-size: 12px;
  color: #adb5bd;
}

.exam-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6c757d;
}

.exam-stats .stat {
  white-space: nowrap;
}

.exam-score {
  text-align: right;
  min-width: 60px;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
}

.score-high {
  color: #28a745;
}

.score-medium {
  color: #ffc107;
}

.score-low {
  color: #dc3545;
}

.score-detail {
  font-size: 12px;
  color: #6c757d;
  display: block;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}

.btn-primary {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #e0e0e0;
  color: #2c3e50;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty p {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .exam-info {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .exam-stats {
    flex-wrap: wrap;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sort-controls {
    flex-wrap: wrap;
  }
}
</style>