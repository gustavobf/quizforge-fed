<template>
  <div class="exam-container">
    <div v-if="examStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading exam...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <div class="error-icon">❌</div>
      <h3>{{ errorMessage }}</h3>
      <button @click="goHome" class="btn-primary">Go Home</button>
    </div>

    <div v-else-if="examStore.result" class="result">
      <div class="result-header">
        <h2>📊 Exam Results</h2>
        <p class="result-subtitle">{{ examStore.result.title }}</p>
      </div>

      <div class="score-card">
        <div class="score-circle">
          <div class="score-number">
            {{ Math.round(examStore.result.score) }}
          </div>
          <div class="score-label">%</div>
        </div>
        <div class="score-stats">
          <div class="stat-item correct">
            <span class="stat-value">{{
              examStore.result.correctAnswers
            }}</span>
            <span class="stat-label">Correct</span>
          </div>
          <div class="stat-item wrong">
            <span class="stat-value">{{ examStore.result.wrongAnswers }}</span>
            <span class="stat-label">Wrong</span>
          </div>
          <div class="stat-item total">
            <span class="stat-value">{{
              examStore.result.totalQuestions
            }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item time">
            <span class="stat-value">{{
              examStore.result.timeSpentInMinutes
            }}</span>
            <span class="stat-label">Minutes</span>
          </div>
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
          <div class="review-header">
            <span class="question-number">Q{{ q.number }}</span>
            <span class="question-status">{{ q.isCorrect ? "✅" : "❌" }}</span>
            <span class="question-type-badge">{{ q.questionType }}</span>
          </div>
          <p class="question-text">{{ q.statement }}</p>
          <div class="answer-comparison">
            <div class="your-answer">
              <span class="label">Your answer: </span>
              <span class="value" :class="{ 'text-danger': !q.isCorrect }">
                {{ formatAnswers(q.yourAnswer) }}
              </span>
            </div>
            <div class="correct-answer">
              <span class="label">Correct answer: </span>
              <span class="value text-success">{{
                formatAnswers(q.correctAnswer)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <button @click="goHome" class="btn-primary btn-large">New Exam</button>
    </div>

    <div v-else-if="examStore.currentQuestion" class="question">
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label"
            >Question {{ currentNumber }} of {{ totalQuestions }}</span
          >
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <div class="question-card">
        <div class="question-header">
          <span class="question-badge">Q{{ currentNumber }}</span>
          <span v-if="isMultipleChoice" class="question-type multiple"
            >Multiple Choice</span
          >
          <span v-else class="question-type single">Single Choice</span>
        </div>

        <h3 class="question-text">{{ examStore.currentQuestion.statement }}</h3>
        <p v-if="examStore.examData?.subjectName" class="subject-tag">
          📚 {{ examStore.examData.subjectName }}
        </p>

        <div class="alternatives-list">
          <div
            v-for="alt in examStore.currentQuestion.alternatives"
            :key="alt.alternativeId"
            class="alternative"
            :class="{ selected: isAlternativeSelected(alt.alternativeId) }"
            @click="toggleAlternative(alt.alternativeId)"
          >
            <div class="alternative-input">
              <input
                :type="inputType"
                :value="alt.alternativeId"
                :checked="isAlternativeSelected(alt.alternativeId)"
                @change="toggleAlternative(alt.alternativeId)"
              />
            </div>
            <label class="alternative-text">{{ alt.description }}</label>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <div class="nav-buttons">
          <button
            v-if="!isFirstQuestion"
            @click="examStore.previousQuestion()"
            class="btn-secondary"
          >
            ← Previous
          </button>
          <button
            v-if="!isLastQuestion"
            @click="examStore.nextQuestion()"
            class="btn-primary"
          >
            Next →
          </button>
          <button
            v-if="isLastQuestion"
            @click="finishExam"
            :disabled="isSubmitting"
            class="btn-primary btn-success"
          >
            {{ isSubmitting ? "Submitting..." : "Finish Exam" }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">📭</div>
      <p>{{ loadingMessage || "No questions available" }}</p>
      <button @click="goHome" class="btn-primary">Go Home</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useExamStore } from "@/stores/examStore";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const examStore = useExamStore();
const { showError, showSuccess } = useToast();

const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);
const loadingMessage = ref<string | null>(null);

const totalQuestions = computed(() => examStore.totalQuestions || 0);
const currentNumber = computed(() => examStore.currentIndex + 1);
const isFirstQuestion = computed(() => examStore.currentIndex === 0);
const isLastQuestion = computed(
  () => examStore.currentIndex === totalQuestions.value - 1,
);

const isMultipleChoice = computed(() => {
  if (!examStore.currentQuestion) return false;
  const question = examStore.currentQuestion;
  if (question.questionType) {
    return question.questionType === "MULTIPLE_CHOICE";
  }
  return (
    question.alternatives.length > 4 ||
    question.statement.toLowerCase().includes("select all") ||
    question.statement.toLowerCase().includes("(select all)")
  );
});

const inputType = computed(() => {
  return isMultipleChoice.value ? "checkbox" : "radio";
});

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((examStore.answeredCount / totalQuestions.value) * 100);
});

const isAlternativeSelected = (alternativeId: number) => {
  const currentAnswers = examStore.currentAnswers || [];
  return currentAnswers.includes(alternativeId);
};

const toggleAlternative = (alternativeId: number) => {
  const currentAnswers = examStore.currentAnswers || [];
  let newAnswers: number[];

  if (isMultipleChoice.value) {
    if (currentAnswers.includes(alternativeId)) {
      newAnswers = currentAnswers.filter((id) => id !== alternativeId);
    } else {
      newAnswers = [...currentAnswers, alternativeId];
    }
  } else {
    if (currentAnswers.includes(alternativeId)) {
      newAnswers = [];
    } else {
      newAnswers = [alternativeId];
    }
  }

  examStore.selectAnswer(newAnswers);
};

async function finishExam() {
  if (isSubmitting.value) return;

  const total = examStore.totalQuestions;
  const answered = examStore.answeredCount;

  if (answered < total) {
    const confirmSubmit = confirm(
      `You have ${total - answered} unanswered questions. Are you sure you want to submit?`,
    );
    if (!confirmSubmit) return;
  }

  isSubmitting.value = true;
  try {
    await examStore.finishExam();
    showSuccess("Exam completed successfully!");
  } catch (error: any) {
    console.error("Finish exam error:", error);
    showError(error.message || "Failed to finish exam");
  } finally {
    isSubmitting.value = false;
  }
}

function goHome() {
  examStore.reset();
  localStorage.removeItem("examData");
  router.push("/");
}

function formatAnswers(answers: any): string {
  if (!answers) return "Not answered";

  if (typeof answers === "string") {
    try {
      let cleaned = answers
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .replace(/"/g, "")
        .trim();

      if (!cleaned) return "Not answered";

      if (cleaned.includes(",")) {
        return cleaned
          .split(",")
          .map((s) => s.trim())
          .join(", ");
      }

      return cleaned;
    } catch (e) {
      return answers || "Not answered";
    }
  }

  if (Array.isArray(answers)) {
    if (answers.length === 0) return "Not answered";
    return answers.join(", ");
  }

  return String(answers) || "Not answered";
}

watch(
  () => examStore.currentAnswers,
  (newVal) => {
    console.log("currentAnswers mudou:", newVal);
  },
  { deep: true },
);

watch(
  () => examStore.answers,
  (newVal) => {
    console.log("answers mudou:", newVal);
  },
  { deep: true },
);

onMounted(() => {
  const examId = Number(props.id);

  console.log("=== EXAM VIEW MOUNTED ===");
  console.log("Props ID:", props.id);
  console.log("Exam ID (number):", examId);

  if (!examStore.examData) {
    const restored = examStore.restoreFromLocalStorage();
    if (restored) {
      console.log("Dados restaurados do localStorage");
      loadingMessage.value = "Dados restaurados!";
    } else {
      errorMessage.value = "No exam data found. Please create a new exam.";
      return;
    }
  }

  if (!examStore.examData) {
    errorMessage.value = "No exam data found. Please create a new exam.";
    return;
  }

  if (examStore.examId !== examId) {
    errorMessage.value = `Exam ID mismatch. Store ID: ${examStore.examId}, Route ID: ${examId}`;
    return;
  }

  if (examStore.questions.length === 0) {
    errorMessage.value = "No questions available in this exam.";
    return;
  }

  console.log("✅ Questões carregadas com sucesso!");
  console.log("Total de questões:", examStore.questions.length);
  console.log("Respostas iniciais:", examStore.answers);
});
</script>

<style scoped>
.exam-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-section {
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.progress-percentage {
  font-weight: 700;
  color: #1976d2;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.question-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1976d2;
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 20px;
  min-width: 40px;
}

.question-type {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-type.multiple {
  background: #e8eaf6;
  color: #3949ab;
}

.question-type.single {
  background: #e3f2fd;
  color: #1565c0;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  color: #1a2332;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.subject-tag {
  color: #6c757d;
  font-size: 14px;
  margin: 0 0 20px 0;
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alternative {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.alternative:hover {
  border-color: #90caf9;
  background: #f5f9ff;
  transform: translateX(4px);
}

.alternative.selected {
  border-color: #1976d2;
  background: #e3f2fd;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.08);
}

.alternative-input {
  display: flex;
  align-items: center;
  justify-content: center;
}

.alternative input[type="radio"],
.alternative input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #1976d2;
}

.alternative-text {
  flex: 1;
  cursor: pointer;
  font-size: 15px;
  color: #1a2332;
  line-height: 1.4;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: space-between;
}

.btn-primary {
  background: #1976d2;
  color: white;
  border: none;
  padding: 12px 36px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #e9ecef;
  color: #2c3e50;
  border: none;
  padding: 12px 36px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-secondary:hover:not(:disabled) {
  background: #dde1e6;
  transform: translateY(-1px);
}

.btn-success {
  background: #4caf50;
}

.btn-success:hover:not(:disabled) {
  background: #388e3c;
}

.btn-large {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e9ecef;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 500px;
  margin: 40px auto;
}

.error-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
}

.error-container h3 {
  color: #f44336;
  margin-bottom: 8px;
}

.empty {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 500px;
  margin: 40px auto;
}

.empty-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
}

.empty p {
  color: #6c757d;
  margin-bottom: 16px;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.result-header h2 {
  font-size: 28px;
  color: #1a2332;
  margin-bottom: 4px;
}

.result-subtitle {
  color: #6c757d;
  font-size: 16px;
}

.score-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 32px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.score-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
}

.score-stats {
  display: flex;
  gap: 32px;
  flex: 1;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
}

.stat-item .stat-label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.stat-item.correct .stat-value {
  color: #4caf50;
}

.stat-item.wrong .stat-value {
  color: #f44336;
}

.stat-item.total .stat-value {
  color: #1976d2;
}

.stat-item.time .stat-value {
  color: #ff9800;
}

.questions-review {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.questions-review h3 {
  font-size: 18px;
  color: #1a2332;
  margin-bottom: 16px;
}

.review-item {
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.review-item:last-child {
  margin-bottom: 0;
}

.review-item.correct {
  border-color: #a5d6a7;
  background: #f1f8f1;
}

.review-item.wrong {
  border-color: #ef9a9a;
  background: #fdf2f2;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-number {
  font-weight: 700;
  color: #1a2332;
  font-size: 15px;
}

.question-status {
  font-size: 18px;
}

.question-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  background: #e9ecef;
  color: #6c757d;
}

.question-text {
  font-size: 15px;
  color: #1a2332;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.answer-comparison {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.answer-comparison .label {
  font-weight: 500;
  color: #6c757d;
}

.answer-comparison .value {
  font-weight: 500;
}

.text-danger {
  color: #f44336;
}

.text-success {
  color: #4caf50;
}

@media (max-width: 768px) {
  .exam-container {
    padding: 12px;
  }

  .question-card {
    padding: 20px;
  }

  .question-text {
    font-size: 17px;
  }

  .score-card {
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }

  .score-stats {
    gap: 16px;
    justify-content: center;
  }

  .alternative {
    padding: 12px 14px;
  }

  .alternative-text {
    font-size: 14px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    font-size: 14px;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .score-stats {
    gap: 12px;
  }

  .stat-item .stat-value {
    font-size: 22px;
  }

  .progress-header {
    font-size: 13px;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>