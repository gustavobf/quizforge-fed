<!-- components/history/ExamDetailModal.vue -->

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📝 {{ exam?.title || 'Exam Details' }}</h2>
          <button class="close-btn" @click="close">✕</button>
        </div>

        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading exam details...</p>
        </div>

        <div v-else-if="error" class="error">
          {{ error }}
          <button @click="loadExam" class="btn-retry">Retry</button>
        </div>

        <div v-else-if="exam" class="modal-body">
          <!-- Summary -->
          <div class="exam-summary">
            <div class="summary-item">
              <span class="label">Subject</span>
              <span class="value">{{ exam.subjectName || 'No Subject' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Questions</span>
              <span class="value">{{ exam.totalQuestions }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Correct Answers</span>
              <span class="value correct">{{ exam.correctAnswers }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Wrong Answers</span>
              <span class="value wrong">{{ exam.wrongAnswers }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Score</span>
              <span class="value" :class="getScoreClass(exam.score)">{{ exam.score?.toFixed(1) }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">Time Spent</span>
              <span class="value">{{ exam.timeSpentInMinutes }} min</span>
            </div>
            <div class="summary-item">
              <span class="label">Finished At</span>
              <span class="value">{{ formatDate(exam.finishedAt) }}</span>
            </div>
          </div>

          <!-- Questions -->
          <div class="questions-section">
            <h3>Questions Review</h3>
            <div
              v-for="q in exam.questions"
              :key="q.number"
              class="question-item"
              :class="{ correct: q.isCorrect, wrong: !q.isCorrect }"
            >
              <div class="question-header">
                <span class="question-number">Q{{ q.number }}</span>
                <span class="question-status">{{ q.isCorrect ? '✅ Correct' : '❌ Wrong' }}</span>
                <span class="question-type">{{ q.questionType }}</span>
              </div>
              <p class="question-statement">{{ q.statement }}</p>

              <div class="alternatives">
                <div
                  v-for="alt in q.alternatives"
                  :key="alt.alternativeId"
                  class="alternative"
                  :class="{
                    correct: alt.isCorrect,
                    selected: isAlternativeSelected(q, alt),
                    missed: alt.isCorrect && !isAlternativeSelected(q, alt)
                  }"
                >
                  <span class="alt-label">{{ getLabel(alt.alternativeId) }}</span>
                  <span class="alt-text">{{ alt.description }}</span>
                  <span v-if="alt.isCorrect" class="alt-icon">✅</span>
                  <span v-if="isAlternativeSelected(q, alt) && !alt.isCorrect" class="alt-icon">❌</span>
                  <span v-if="alt.isCorrect && !isAlternativeSelected(q, alt)" class="alt-icon">🔵</span>
                </div>
              </div>

              <div class="answer-comparison">
                <div class="your-answer">
                  <strong>Your answer: </strong>
                  <span :class="{ 'text-danger': !q.isCorrect }">
                    {{ q.yourAnswer?.join(', ') || 'Not answered' }}
                  </span>
                </div>
                <div class="correct-answer">
                  <strong>Correct answer: </strong>
                  <span class="text-success">{{ q.correctAnswer?.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <span class="empty-icon">📭</span>
          <p>No exam data available</p>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import type { HistoryExamDetail } from '@/api/historyApi'

const props = defineProps<{
  visible: boolean
  examId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const historyStore = useHistoryStore()
const exam = ref<HistoryExamDetail | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const getLabel = (id: number): string => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  return letters[id % letters.length]
}

const formatDate = (date: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getScoreClass = (score: number): string => {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-medium'
  return 'score-low'
}

const isAlternativeSelected = (question: HistoryExamDetail['questions'][0], alt: any): boolean => {
  return question.yourAnswer?.includes(alt.description) || false
}

async function loadExam() {
  if (!props.examId) return

  isLoading.value = true
  error.value = null

  try {
    exam.value = await historyStore.loadExamDetail(props.examId)
  } catch (err: any) {
    error.value = err.message || 'Failed to load exam details'
  } finally {
    isLoading.value = false
  }
}

function close() {
  emit('close')
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.examId) {
    loadExam()
  }
}, { immediate: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0 8px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #dc3545;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading {
  text-align: center;
  padding: 40px;
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

.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
}

.btn-retry {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.btn-retry:hover {
  background: #c82333;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background: #e0e0e0;
  color: #2c3e50;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.exam-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-item .label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.summary-item .value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-item .value.correct {
  color: #28a745;
}

.summary-item .value.wrong {
  color: #dc3545;
}

.score-high {
  color: #28a745 !important;
}

.score-medium {
  color: #ffc107 !important;
}

.score-low {
  color: #dc3545 !important;
}

.questions-section h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.question-item {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s;
}

.question-item.correct {
  border-color: #a5d6a7;
  background: #f1f8f1;
}

.question-item.wrong {
  border-color: #ef9a9a;
  background: #fdf2f2;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.question-number {
  font-weight: 700;
  color: #2c3e50;
}

.question-status {
  font-weight: 600;
  font-size: 14px;
}

.question-type {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  background: #e9ecef;
  color: #6c757d;
}

.question-statement {
  margin: 0 0 12px 0;
  color: #1a2332;
  font-size: 15px;
}

.alternatives {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.alternative {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.alternative.correct {
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
}

.alternative.selected {
  background: #e3f2fd;
  border-left: 3px solid #1976d2;
}

.alternative.missed {
  background: #fff3e0;
  border-left: 3px solid #ff9800;
}

.alt-label {
  font-weight: 700;
  color: #6c757d;
  min-width: 20px;
}

.alt-text {
  flex: 1;
  color: #1a2332;
}

.alt-icon {
  font-size: 14px;
  margin-left: 4px;
}

.answer-comparison {
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.answer-comparison strong {
  color: #6c757d;
}

.text-danger {
  color: #dc3545;
}

.text-success {
  color: #28a745;
}

@media (max-width: 768px) {
  .exam-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .question-header {
    flex-wrap: wrap;
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>