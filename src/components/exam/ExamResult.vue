<template>
  <div class="result">
    <div class="result-header">
      <h2>📊 Exam Results</h2>
      <p class="result-subtitle">{{ result.title }}</p>
    </div>

    <div class="score-card">
      <div
        class="score-circle"
        :aria-label="`Score: ${Math.round(result.score)}%`"
      >
        <div class="score-number">{{ Math.round(result.score) }}</div>
        <div class="score-label">%</div>
      </div>
      <div class="score-stats">
        <div class="stat-item correct">
          <span class="stat-value">{{ result.correctAnswers }}</span>
          <span class="stat-label">Correct</span>
        </div>
        <div class="stat-item wrong">
          <span class="stat-value">{{ result.wrongAnswers }}</span>
          <span class="stat-label">Wrong</span>
        </div>
        <div class="stat-item total">
          <span class="stat-value">{{ result.totalQuestions }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item time">
          <span class="stat-value">{{ result.timeSpentInMinutes }}</span>
          <span class="stat-label">Minutes</span>
        </div>
      </div>
    </div>

    <div class="questions-review">
      <h3>Answer Key</h3>
      <div
        v-for="q in result.questions"
        :key="q.number"
        class="review-item"
        :class="q.isCorrect ? 'correct' : 'wrong'"
      >
        <div class="review-header">
          <span class="question-number">Q{{ q.number }}</span>
          <span class="question-status">{{ q.isCorrect ? '✅' : '❌' }}</span>
          <span class="question-type-badge">{{ q.questionType }}</span>
        </div>
        <p class="question-text">{{ q.statement }}</p>
        <div class="answer-comparison">
          <div class="answer-row">
            <span class="answer-label">Your answer: </span>
            <span class="answer-value" :class="{ 'text-danger': !q.isCorrect }">
              {{ formatAnswers(q.yourAnswer) }}
            </span>
          </div>
          <div class="answer-row">
            <span class="answer-label">Correct answer: </span>
            <span class="answer-value text-success">{{ formatAnswers(q.correctAnswer) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamResultResponse } from '@/types/exam.types'

defineProps<{
  result: ExamResultResponse
}>()

function formatAnswers(answers: string | string[] | null | undefined): string {
  if (!answers) return 'Not answered'
  if (Array.isArray(answers)) {
    return answers.length === 0 ? 'Not answered' : answers.join(', ')
  }
  if (typeof answers === 'string') {
    const cleaned = answers.replace(/^\[/, '').replace(/\]$/, '').replace(/"/g, '').trim()
    if (!cleaned) return 'Not answered'
    return cleaned.includes(',')
      ? cleaned.split(',').map((s) => s.trim()).join(', ')
      : cleaned
  }
  return String(answers) || 'Not answered'
}
</script>

<style scoped>
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
  flex-wrap: wrap;
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

.stat-item.correct .stat-value { color: #4caf50; }
.stat-item.wrong .stat-value { color: #f44336; }
.stat-item.total .stat-value { color: #1976d2; }
.stat-item.time .stat-value { color: #ff9800; }

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
}

.question-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #e9ecef;
  color: #6c757d;
  text-transform: uppercase;
}

.question-text {
  font-size: 15px;
  color: #1a2332;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.answer-comparison {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.answer-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.answer-label {
  color: #6c757d;
}

.answer-value {
  font-weight: 600;
  color: #2c3e50;
}

.text-danger { color: #dc3545; }
.text-success { color: #28a745; }

@media (max-width: 600px) {
  .score-card {
    flex-direction: column;
    align-items: center;
  }

  .score-stats {
    justify-content: center;
  }
}
</style>
