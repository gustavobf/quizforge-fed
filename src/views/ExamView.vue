<template>
  <div class="exam-container">
    <div v-if="examStore.isLoading" class="state-card loading-state">
      <AppSpinner :size="48" />
      <p>Loading exam...</p>
    </div>
    <div v-else-if="errorMessage" class="state-card">
      <span class="state-icon" aria-hidden="true">❌</span>
      <h3>{{ errorMessage }}</h3>
      <button @click="goHome" class="btn-primary">Go Home</button>
    </div>
    <template v-else-if="examStore.result">
      <ExamResult :result="examStore.result" />
      <button @click="goHome" class="btn-primary btn-large">New Exam</button>
    </template>
    <template v-else-if="examStore.currentQuestion">
      <ExamProgress :current="currentNumber" :total="totalQuestions" :percentage="progressPercentage" />
      <ExamQuestion
        :question="examStore.currentQuestion"
        :question-number="currentNumber"
        :selected-answers="examStore.currentAnswers"
        :is-multiple-choice="isMultipleChoice"
        :subject-name="examStore.examData?.subjectName"
        @toggle="toggleAlternative"
      />
      <div class="action-bar">
        <div class="nav-buttons">
          <button v-if="!isFirstQuestion" @click="examStore.previousQuestion()" class="btn-secondary">← Previous</button>
          <button v-if="!isLastQuestion" @click="examStore.nextQuestion()" class="btn-primary">Next →</button>
          <button v-if="isLastQuestion" @click="finishExam" :disabled="isSubmitting" class="btn-primary btn-finish">
            {{ isSubmitting ? 'Submitting...' : 'Finish Exam' }}
          </button>
        </div>
      </div>
    </template>
    <div v-else class="state-card">
      <span class="state-icon" aria-hidden="true">📭</span>
      <p>No questions available</p>
      <button @click="goHome" class="btn-primary">Go Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/examStore'
import { useToast } from '@/composables/useToast'
import AppSpinner from '@/components/common/AppSpinner.vue'
import ExamProgress from '@/components/exam/ExamProgress.vue'
import ExamQuestion from '@/components/exam/ExamQuestion.vue'
import ExamResult from '@/components/exam/ExamResult.vue'

const props = defineProps<{ id: string }>()

const router = useRouter()
const examStore = useExamStore()
const { showError, showSuccess } = useToast()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const totalQuestions = computed(() => examStore.totalQuestions || 0)
const currentNumber = computed(() => examStore.currentIndex + 1)
const isFirstQuestion = computed(() => examStore.currentIndex === 0)
const isLastQuestion = computed(() => examStore.currentIndex === totalQuestions.value - 1)

const isMultipleChoice = computed(() => examStore.currentQuestion?.questionType === 'MULTIPLE_CHOICE' ?? false)

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((examStore.answeredCount / totalQuestions.value) * 100)
})

function toggleAlternative(alternativeId: number) {
  const current = examStore.currentAnswers ?? []
  let next: number[]
  if (isMultipleChoice.value) {
    next = current.includes(alternativeId) ? current.filter((id) => id !== alternativeId) : [...current, alternativeId]
  } else {
    next = current.includes(alternativeId) ? [] : [alternativeId]
  }
  examStore.selectAnswer(next)
}

async function finishExam() {
  if (isSubmitting.value) return
  const unanswered = examStore.totalQuestions - examStore.answeredCount
  if (unanswered > 0) {
    const confirmed = confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`)
    if (!confirmed) return
  }
  isSubmitting.value = true
  try {
    await examStore.finishExam()
    showSuccess('Exam completed successfully!')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to finish exam'
    showError(message)
  } finally {
    isSubmitting.value = false
  }
}

function goHome() {
  examStore.reset()
  router.push('/')
}

onMounted(() => {
  const examId = Number(props.id)
  if (!examStore.examData) {
    const restored = examStore.restoreFromLocalStorage()
    if (!restored) {
      errorMessage.value = 'No exam data found. Please create a new exam.'
      return
    }
  }
  if (!examStore.examData) {
    errorMessage.value = 'No exam data found. Please create a new exam.'
    return
  }
  if (examStore.examId !== examId) {
    errorMessage.value = 'Exam ID mismatch. Please create a new exam.'
    return
  }
  if (examStore.questions.length === 0) {
    errorMessage.value = 'No questions available in this exam.'
  }
})
</script>

<style scoped>
.exam-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.state-card {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  max-width: 500px;
  margin: 40px auto;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #6c757d;
}
.state-icon { font-size: 56px; display: block; margin-bottom: 16px; }
.state-card h3 { color: #f44336; margin-bottom: 16px; }
.state-card p { color: #6c757d; margin-bottom: 16px; }
.action-bar { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e9ecef; }
.nav-buttons { display: flex; gap: 12px; justify-content: space-between; }
.btn-primary {
  background: #1976d2; color: white; border: none; padding: 12px 36px;
  border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease; min-width: 120px;
}
.btn-primary:hover:not(:disabled) {
  background: #1565c0; transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25,118,210,0.3);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-secondary {
  background: #e9ecef; color: #2c3e50; border: none; padding: 12px 36px;
  border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease; min-width: 120px;
}
.btn-secondary:hover { background: #dde1e6; transform: translateY(-1px); }
.btn-finish { background: #4caf50; }
.btn-finish:hover:not(:disabled) { background: #388e3c; }
.btn-large { width: 100%; padding: 14px; font-size: 16px; margin-top: 8px; }
@media (max-width: 600px) {
  .exam-container { padding: 12px; }
  .nav-buttons { flex-wrap: wrap; }
  .btn-primary, .btn-secondary { flex: 1; min-width: unset; padding: 12px 16px; }
}
</style>
