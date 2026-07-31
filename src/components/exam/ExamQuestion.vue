<template>
  <div class="question-card">
    <div class="question-header">
      <span class="question-badge">Q{{ questionNumber }}</span>
      <span v-if="isMultipleChoice" class="question-type multiple">Multiple Choice</span>
      <span v-else class="question-type single">Single Choice</span>
    </div>

    <h3 class="question-text">{{ question.statement }}</h3>
    <p v-if="subjectName" class="subject-tag">📚 {{ subjectName }}</p>

    <div
      class="alternatives-list"
      role="group"
      :aria-label="isMultipleChoice ? 'Select all that apply' : 'Select one answer'"
    >
      <div
        v-for="alt in question.alternatives"
        :key="alt.alternativeId"
        class="alternative"
        :class="{ selected: selectedAnswers.includes(alt.alternativeId) }"
        @click="$emit('toggle', alt.alternativeId)"
      >
        <div class="alternative-input">
          <input
            :type="isMultipleChoice ? 'checkbox' : 'radio'"
            :value="alt.alternativeId"
            :checked="selectedAnswers.includes(alt.alternativeId)"
            :aria-label="alt.description"
            @change.stop="$emit('toggle', alt.alternativeId)"
            @click.stop
          />
        </div>
        <label class="alternative-text">{{ alt.description }}</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '@/types/exam.types'

defineProps<{
  question: Question
  questionNumber: number
  selectedAnswers: number[]
  isMultipleChoice: boolean
  subjectName?: string | null
}>()

defineEmits<{
  toggle: [alternativeId: number]
}>()
</script>

<style scoped>
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

.alternative input[type='radio'],
.alternative input[type='checkbox'] {
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

@media (max-width: 600px) {
  .question-card {
    padding: 20px 16px;
  }

  .question-text {
    font-size: 17px;
  }
}
</style>
