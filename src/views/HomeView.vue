<template>
  <div class="home">
    <div class="home-header">
      <h1>🏠 QuizForge</h1>
      <p class="subtitle">Test your knowledge with our exam simulator!</p>
    </div>

    <div class="home-grid">
      <div class="exam-creator">
        <h2>📝 New Exam</h2>
        <form @submit.prevent="startExam">
          <div class="form-group">
            <label for="title">Title</label>
            <input
              id="title"
              v-model="title"
              type="text"
              placeholder="Enter exam title..."
              required
            />
          </div>

          <div class="form-group">
            <label for="subject">Subject</label>
            <select id="subject" v-model="subjectId">
              <option :value="undefined">All Subjects</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantity">Number of Questions</label>
            <input
              id="quantity"
              v-model.number="quantity"
              type="number"
              min="1"
              max="50"
              required
            />
          </div>

          <button type="submit" :disabled="isLoading" class="btn-primary">
            {{ isLoading ? 'Creating...' : 'Start Exam' }}
          </button>
        </form>
      </div>

      <div class="quick-stats" v-if="summary">
        <h2>📊 Your Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ summary.totalExams }}</span>
            <span class="stat-label">Exams Taken</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ summary.totalQuestionsAnswered }}</span>
            <span class="stat-label">Questions Answered</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ summary.averageScore }}%</span>
            <span class="stat-label">Avg. Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ summary.bestScore }}%</span>
            <span class="stat-label">Best Score</span>
          </div>
        </div>
      </div>
    </div>

    <div class="recent-exams" v-if="recentExams.length > 0">
      <div class="recent-header">
        <h2>📚 Recent Exams</h2>
        <router-link to="/history" class="view-all">View All →</router-link>
      </div>

      <div class="recent-list">
        <div
          v-for="exam in recentExams"
          :key="exam.id"
          class="recent-item"
        >
          <div class="recent-info">
            <span class="recent-title">{{ exam.title }}</span>
            <span class="recent-subject">{{ exam.subjectName }}</span>
            <span class="recent-date">{{ formatDate(exam.finishedAt) }}</span>
          </div>
          <div class="recent-score">
            <span class="score-value" :class="getScoreClass(exam.score)">
              {{ exam.score }}%
            </span>
            <span class="score-detail">
              {{ exam.correctAnswers }}/{{ exam.totalQuestions }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoadingSummary" class="loading">
      Loading history...
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/examStore'
import { useHistoryStore } from '@/stores/historyStore'
import { subjectApi, type Subject } from '@/api/subjectApi'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const examStore = useExamStore()
const historyStore = useHistoryStore()
const { showError, showSuccess } = useToast()

const title = ref('New Exam')
const subjectId = ref<number | undefined>(undefined)
const quantity = ref(10)
const isLoading = ref(false)
const isLoadingSummary = ref(false)
const error = ref('')
const subjects = ref<Subject[]>([])

const summary = computed(() => historyStore.summary)
const recentExams = computed(() => summary.value?.recentExams || [])

async function loadSubjects() {
  try {
    const response = await subjectApi.getAll()
    subjects.value = response.data
  } catch (err) {
    showError('Failed to load subjects')
  }
}

async function loadHistorySummary() {
  isLoadingSummary.value = true
  try {
    await historyStore.loadSummary()
  } catch (err) {
    showError('Failed to load history')
  } finally {
    isLoadingSummary.value = false
  }
}

async function startExam() {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''

  try {
    const exam = await examStore.createExam(
      title.value || 'New Exam',
      quantity.value,
      subjectId.value
    )
    
    showSuccess('Exam created successfully!')
    router.push(`/exam/${exam.examId}`)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create exam'
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-medium'
  return 'score-low'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  loadSubjects()
  loadHistorySummary()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.home-header {
  margin-bottom: 30px;
}

.home-header h1 {
  font-size: 32px;
  color: #2c3e50;
}

.subtitle {
  color: #6c757d;
  margin-top: 4px;
}

.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}

.exam-creator {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.exam-creator h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input::placeholder {
  color: #adb5bd;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #42b883;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
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
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-stats {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.quick-stats h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.recent-exams {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recent-header h2 {
  color: #2c3e50;
  margin: 0;
}

.view-all {
  color: #42b883;
  text-decoration: none;
  font-weight: 600;
}

.view-all:hover {
  text-decoration: underline;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  pointer-events: none;
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.error {
  color: #dc3545;
  margin-top: 12px;
  padding: 10px;
  background: #f8d7da;
  border-radius: 6px;
}
</style>