<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">×</button>

      <div v-if="loading" class="loading">
        Loading exam details...
      </div>

      <div v-else-if="exam" class="exam-detail">
        <h2>{{ exam.title }}</h2>
        <p class="detail-subject">{{ exam.subjectName }}</p>

        <div class="detail-stats">
          <div class="stat-item">
            <span class="stat-value">{{ exam.score }}%</span>
            <span class="stat-label">Score</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ exam.correctAnswers }}/{{ exam.totalQuestions }}</span>
            <span class="stat-label">Correct</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ exam.timeSpentInMinutes }} min</span>
            <span class="stat-label">Time Spent</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatDate(exam.finishedAt) }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>

        <div class="detail-status">
          <span class="status-badge" :class="exam.status.toLowerCase()">
            {{ exam.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import type { ExamHistory } from '@/api/historyApi'

const props = defineProps<{
  visible: boolean
  examId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const historyStore = useHistoryStore()
const exam = ref<ExamHistory | null>(null)
const loading = ref(false)

watch(() => props.examId, async (newId) => {
  if (newId && props.visible) {
    await loadExam(newId)
  }
}, { immediate: true })

async function loadExam(id: number) {
  loading.value = true
  try {
    exam.value = await historyStore.loadById(id)
  } catch (error) {
    console.error('Failed to load exam:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #2c3e50;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.exam-detail h2 {
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.detail-subject {
  color: #6c757d;
  margin-bottom: 20px;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.detail-status {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}
</style>