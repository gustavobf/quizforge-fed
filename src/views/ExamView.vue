<template>
  <div class="exam-container">
    <!-- Loading State -->
    <div v-if="isLoading || examStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading exam...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="error-container">
      <span class="error-icon">❌</span>
      <h3>Failed to load exam</h3>
      <p>{{ errorMessage }}</p>
      <button @click="goHome" class="btn-primary">Go Home</button>
    </div>

    <!-- Results -->
    <div v-else-if="examStore.result" class="result">
      <h2>Exam Results</h2>
      <div class="score">
        <div class="score-circle">
          <span class="score-number">{{ examStore.result.score }}</span>
          <span class="score-label">%</span>
        </div>
        <div class="score-details">
          <p>Correct: {{ examStore.result.correctAnswers }}</p>
          <p>Wrong: {{ examStore.result.wrongAnswers }}</p>
          <p>Total: {{ examStore.result.totalQuestions }}</p>
        </div>
      </div>

      <div class="questions-review">
        <h3>Answer Key</h3>
        <div
          v-for="q in examStore.result.questions"
          :key="q.number"
          class="review-item"
          :class="{ correct: q.isCorrect, wrong: !q.isCorrect }"
        >
          <div class="question-header">
            <span class="number">Q{{ q.number }}</span>
            <span class="status">{{ q.isCorrect ? '✅' : '❌' }}</span>
          </div>
          <p class="statement">{{ q.statement }}</p>
          <div class="answers">
            <p class="your-answer">Your answer: {{ q.yourAnswer }}</p>
            <p class="correct-answer">Correct answer: {{ q.correctAnswer }}</p>
          </div>
        </div>
      </div>

      <button @click="goHome" class="btn-primary">New Exam</button>
    </div>

    <!-- Question -->
    <div v-else-if="examStore.currentQuestion" class="question" :key="examStore.currentIndex">
      <div class="progress">
        <span>Question {{ currentNumber }}/{{ totalQuestions }}</span>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span>{{ progressPercentage }}%</span>
      </div>

      <div class="question-content">
        <h3>{{ examStore.currentQuestion.statement }}</h3>
        <p v-if="examStore.currentQuestion.subjectName" class="subject">
          Subject: {{ examStore.currentQuestion.subjectName }}
        </p>

        <div class="alternatives">
          <div
            v-for="alt in examStore.currentQuestion.alternatives"
            :key="alt.id"
            class="alternative"
            :class="{
              selected: selectedAlternative === alt.id,
              answered: isAnswered
            }"
            @click="selectAlternative(alt.id)"
          >
            <input
              type="radio"
              :value="alt.id"
              :checked="selectedAlternative === alt.id"
              :disabled="isAnswered"
              @change="selectAlternative(alt.id)"
            />
            <label>{{ alt.statement }}</label>
          </div>
        </div>
      </div>

      <div class="buttons">
        <button
          @click="handleButtonClick"
          :disabled="isButtonDisabled"
          class="btn-primary"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty">
      <span class="empty-icon">📭</span>
      <p>No question loaded</p>
      <button @click="goHome" class="btn-primary">Go Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/examStore'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const { showError } = useToast()

const selectedAlternative = ref<number | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)
const examId = ref<number | null>(null)

const currentNumber = computed(() => {
  return examStore.currentQuestion?.currentQuestionNumber || examStore.currentIndex + 1
})

const totalQuestions = computed(() => {
  return examStore.totalQuestions || examStore.currentQuestion?.totalQuestions || 0
})

const isAnswered = computed(() => examStore.currentQuestion?.isAnswered || false)
const isLastQuestion = computed(() => {
  return currentNumber.value >= totalQuestions.value
})

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  const answered = examStore.answers.size
  const total = totalQuestions.value
  return Math.round((answered / total) * 100)
})

const buttonText = computed(() => {
  if (isSaving.value) return 'Saving...'
  if (isLastQuestion.value) return 'Finish'
  return 'Answer'
})

const isButtonDisabled = computed(() => {
  if (isSaving.value) return true
  if (!isAnswered.value && selectedAlternative.value === null) return true
  if (isAnswered.value) return true
  return false
})

watch(
  () => examStore.currentQuestion,
  (newQuestion) => {
    if (newQuestion) {
      selectedAlternative.value = null
      isLoading.value = false
      isSaving.value = false
      errorMessage.value = null
      
      console.log('New question loaded:', {
        currentQuestionNumber: newQuestion.currentQuestionNumber,
        isAnswered: newQuestion.isAnswered,
        isLast: newQuestion.currentQuestionNumber >= totalQuestions.value
      })
      
      if (newQuestion.isAnswered && newQuestion.selectedAlternativeId) {
        selectedAlternative.value = newQuestion.selectedAlternativeId
      }
    }
  },
  { immediate: true, deep: true }
)

function selectAlternative(id: number) {
  if (!isAnswered.value && !isSaving.value) {
    selectedAlternative.value = id
  }
}

async function handleButtonClick() {
  if (isSaving.value) return

  if (!isAnswered.value) {
    if (isLastQuestion.value) {
      await answerAndFinish()
    } else {
      await saveAnswer()
    }
  } else if (isLastQuestion.value) {
    await finishExam()
  }
}

async function answerAndFinish() {
  if (selectedAlternative.value === null) return

  console.log('answerAndFinish called - Last question, answering and finishing')

  isSaving.value = true
  try {
    await examStore.answerQuestion(selectedAlternative.value)
    selectedAlternative.value = null
    
    console.log('Answer saved, now finishing...')
    await examStore.finishExam()
    console.log('Exam finished!')
  } catch (error: any) {
    console.error('Answer and finish error:', error)
    showError(error.message || 'Failed to complete exam')
  } finally {
    isSaving.value = false
  }
}

async function saveAnswer() {
  if (selectedAlternative.value === null) return

  isSaving.value = true
  try {
    await examStore.answerQuestion(selectedAlternative.value)
    selectedAlternative.value = null
  } catch (error: any) {
    console.error('Save answer error:', error)
    showError(error.message || 'Failed to save answer')
  } finally {
    isSaving.value = false
  }
}

async function finishExam() {
  isLoading.value = true
  try {
    await examStore.finishExam()
  } catch (error: any) {
    console.error('Finish exam error:', error)
    showError(error.message || 'Failed to finish exam')
  } finally {
    isLoading.value = false
  }
}

function goHome() {
  examStore.reset()
  router.push('/')
}

onMounted(async () => {
  const id = Number(route.params.id)
  examId.value = id
  
  console.log('ExamView mounted with id:', id)

  if (!id) {
    errorMessage.value = 'No exam ID provided'
    return
  }

  try {
    examStore.reset()
    examStore.setExamId(id)
    await examStore.loadCurrentQuestion()
    
    if (!examStore.currentQuestion) {
      errorMessage.value = 'Failed to load exam questions'
    }
  } catch (error: any) {
    console.error('Error loading exam:', error)
    errorMessage.value = error.message || 'Failed to load exam'
    showError(errorMessage.value)
  }
})
</script>

<style scoped>
.exam-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.progress {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #42b883;
  transition: width 0.3s;
}

.question-content {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.subject {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.alternatives {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.alternative {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.alternative:hover:not(.answered) {
  border-color: #42b883;
  background: #f0faf5;
}

.alternative.selected {
  border-color: #42b883;
  background: #f0faf5;
}

.alternative.answered {
  cursor: default;
  opacity: 0.6;
}

.alternative.answered:hover {
  border-color: #e0e0e0;
  background: transparent;
}

.alternative input[type="radio"] {
  margin-right: 8px;
  cursor: pointer;
}

.alternative input[type="radio"]:disabled {
  cursor: not-allowed;
}

.alternative label {
  cursor: pointer;
  flex: 1;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary {
  background: #42b883;
  color: white;
  border: none;
  padding: 12px 48px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 160px;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 50px;
}

.error-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.error-container h3 {
  color: #dc3545;
  margin-bottom: 8px;
}

.error-container p {
  color: #6c757d;
  margin-bottom: 20px;
}

.empty {
  text-align: center;
  padding: 50px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty p {
  color: #6c757d;
  margin: 4px 0;
}

.empty-hint {
  font-size: 14px;
  color: #adb5bd;
  margin-bottom: 16px;
}

.score {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 30px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
}

.score-number {
  font-size: 40px;
  font-weight: bold;
}

.score-label {
  font-size: 16px;
}

.score-details p {
  margin: 5px 0;
}

.questions-review {
  margin-bottom: 30px;
}

.review-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 10px;
}

.review-item.correct {
  border-color: #28a745;
  background: #f0fff4;
}

.review-item.wrong {
  border-color: #dc3545;
  background: #fff5f5;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.your-answer {
  color: #dc3545;
}

.correct-answer {
  color: #28a745;
}
</style>