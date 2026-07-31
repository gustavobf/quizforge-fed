<template>
  <div class="home">
    <div class="home-header">
      <h1>QuizForge</h1>
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
            <div class="quantity-group">
              <input
                id="quantity"
                v-model.number="quantity"
                type="number"
                min="1"
                max="200"
                required
                class="no-spinner"
              />
              <span class="quantity-hint">{{ quantity }} / 200</span>
            </div>
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
import { useSubjectStore } from '@/stores/subjectStore'
import { useToast } from '@/composables/useToast'
import { formatDate, getScoreClass } from '@/utils/formatters'

const router = useRouter()
const examStore = useExamStore()
const historyStore = useHistoryStore()
const subjectStore = useSubjectStore()
const { showError, showSuccess } = useToast()

const title = ref('New Exam')
const subjectId = ref<number | undefined>(undefined)
const quantity = ref(10)
const isLoading = ref(false)
const isLoadingSummary = ref(false)
const error = ref('')

const summary = computed(() => historyStore.summary)
const recentExams = computed(() => summary.value?.recentExams || [])
const subjects = computed(() => subjectStore.subjects)

async function loadHistorySummary() {
  isLoadingSummary.value = true
  try {
    await historyStore.loadSummary()
  } catch {
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
    examStore.reset()
    const exam = await examStore.createExam(title.value || 'New Exam', quantity.value, subjectId.value)
    showSuccess('Exam created successfully!')
    router.push(`/exam/${exam.examId}`)
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create exam'
    error.value = message
    showError(message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  examStore.reset()
  subjectStore.loadSubjects()
  loadHistorySummary()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
}

.home-header {
  margin-bottom: 40px;
}

.home-header h1 {
  font-size: 40px;
  font-weight: 800;
  color: #1e1b4b;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.subtitle {
  color: var(--color-text-light);
  margin-top: 8px;
  font-size: 16px;
}

.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}

.exam-creator {
  background: white;
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.exam-creator h2 {
  color: var(--color-text);
  margin-bottom: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quantity-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-group input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all var(--transition);
  background: var(--color-bg);
}

.quantity-group input:focus {
  border-color: var(--color-primary);
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.quantity-hint {
  font-size: 14px;
  color: var(--color-text-light);
  white-space: nowrap;
  min-width: 70px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
  padding: 8px 12px;
  border-radius: var(--radius-md);
}

.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  -moz-appearance: textfield;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all var(--transition);
  background: var(--color-bg);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary);
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  width: 100%;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-stats {
  background: white;
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.quick-stats h2 {
  color: var(--color-text);
  margin-bottom: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
  padding: 24px;
  border-radius: var(--radius-lg);
  text-align: center;
  border: 2px solid rgba(99, 102, 241, 0.15);
  transition: all var(--transition);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: #1e1b4b;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recent-exams {
  background: white;
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.recent-header h2 {
  color: var(--color-text);
  margin: 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-all {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-all:hover {
  color: var(--color-primary-dark);
  gap: 10px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-light);
  transition: all var(--transition);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(139, 92, 246, 0.02));
}

.recent-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.recent-title {
  font-weight: 600;
  color: var(--color-text);
  font-size: 15px;
}

.recent-subject {
  font-size: 13px;
  color: var(--color-text-light);
}

.recent-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.recent-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.score-value {
  font-size: 20px;
  font-weight: 800;
}

.score-high {
  color: var(--color-success);
}

.score-medium {
  color: var(--color-warning);
}

.score-low {
  color: var(--color-danger);
}

.score-detail {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-light);
  font-size: 16px;
}

.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: var(--color-danger);
  padding: 16px 20px;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-danger);
  margin-top: 20px;
}
</style>