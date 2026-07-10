<template>
  <div class="history-list">
    <div v-if="isLoading && history.length === 0" class="loading">
      Loading history...
    </div>

    <div v-else-if="history.length === 0" class="empty">
      <span class="empty-icon">📭</span>
      <p>No exam history yet</p>
      <p class="empty-hint">Take an exam to see your results here</p>
      <router-link to="/" class="btn-primary">Take an Exam</router-link>
    </div>

    <div v-else>
      <div class="list-header">
        <span class="header-title">Exam</span>
        <span class="header-score">Score</span>
        <span class="header-date">Date</span>
      </div>

      <div
        v-for="exam in history"
        :key="exam.id"
        class="history-item"
      >
        <div class="item-info">
          <span class="item-title">{{ exam.title }}</span>
          <span class="item-subject">{{ exam.subjectName }}</span>
          <span class="item-details">
            {{ exam.totalQuestions }} questions · {{ exam.timeSpentInMinutes }} min
          </span>
        </div>

        <div class="item-score">
          <span class="score-value" :class="getScoreClass(exam.score)">
            {{ exam.score }}%
          </span>
          <span class="score-detail">
            {{ exam.correctAnswers }}/{{ exam.totalQuestions }}
          </span>
        </div>

        <div class="item-date">
          {{ formatDate(exam.finishedAt) }}
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <button
          @click="loadMore"
          :disabled="isLoading"
          class="btn-secondary"
        >
          {{ isLoading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamHistory } from '@/api/historyApi'

const props = defineProps<{
  history: ExamHistory[]
  isLoading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  (e: 'loadMore'): void
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

function loadMore() {
  emit('loadMore')
}
</script>

<style scoped>
.history-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  color: #6c757d;
  font-size: 13px;
}

.history-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-weight: 600;
  color: #2c3e50;
}

.item-subject {
  font-size: 13px;
  color: #6c757d;
}

.item-details {
  font-size: 12px;
  color: #adb5bd;
}

.item-score {
  display: flex;
  flex-direction: column;
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

.score-detail {
  font-size: 12px;
  color: #6c757d;
}

.item-date {
  font-size: 14px;
  color: #6c757d;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.empty {
  text-align: center;
  padding: 60px 20px;
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

.load-more {
  text-align: center;
  padding: 16px 0 8px;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  display: inline-block;
  background: #42b883;
  color: white;
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #359268;
}
</style>