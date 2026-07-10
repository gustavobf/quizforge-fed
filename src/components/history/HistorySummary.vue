<template>
  <div class="history-summary" v-if="summary">
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon">📝</div>
        <div class="summary-content">
          <span class="summary-value">{{ summary.totalExams }}</span>
          <span class="summary-label">Exams Taken</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">❓</div>
        <div class="summary-content">
          <span class="summary-value">{{ summary.totalQuestionsAnswered }}</span>
          <span class="summary-label">Questions Answered</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">✅</div>
        <div class="summary-content">
          <span class="summary-value">{{ summary.totalCorrectAnswers }}</span>
          <span class="summary-label">Correct Answers</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">⭐</div>
        <div class="summary-content">
          <span class="summary-value">{{ summary.averageScore }}%</span>
          <span class="summary-label">Average Score</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">🏆</div>
        <div class="summary-content">
          <span class="summary-value">{{ summary.bestScore }}%</span>
          <span class="summary-label">Best Score</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">📉</div>
        <div class="summary-content">
          <span class="summary-value">{{ summary.worstScore }}%</span>
          <span class="summary-label">Worst Score</span>
        </div>
      </div>
    </div>

    <div class="recent-exams" v-if="summary.recentExams.length > 0">
      <h3>Recent Exams</h3>
      <div class="recent-list">
        <div
          v-for="exam in summary.recentExams"
          :key="exam.id"
          class="recent-item"
          @click="viewExam(exam.id)"
        >
          <div class="recent-info">
            <span class="recent-title">{{ exam.title }}</span>
            <span class="recent-subject">{{ exam.subjectName }}</span>
          </div>
          <div class="recent-score">
            <span class="score-value" :class="getScoreClass(exam.score)">
              {{ exam.score }}%
            </span>
            <span class="recent-date">{{ formatDate(exam.finishedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  summary: any
}>()

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

function viewExam(examId: number) {
  router.push(`/history/${examId}`)
}
</script>

<style scoped>
.history-summary {
  margin-bottom: 30px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 28px;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.summary-label {
  font-size: 12px;
  color: #6c757d;
}

.recent-exams h3 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.recent-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  transform: translateX(4px);
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recent-title {
  font-weight: 600;
  color: #2c3e50;
}

.recent-subject {
  font-size: 13px;
  color: #6c757d;
}

.recent-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.score-value {
  font-size: 20px;
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

.recent-date {
  font-size: 12px;
  color: #adb5bd;
}
</style>