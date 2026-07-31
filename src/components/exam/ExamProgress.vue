<template>
  <div class="progress-section">
    <div class="progress-header">
      <span class="progress-label">Question {{ current }} of {{ total }}</span>
      <span class="progress-percentage">{{ percentage }}%</span>
    </div>
    <div
      class="progress-bar"
      role="progressbar"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: number
  total: number
  percentage: number
}>()
</script>

<style scoped>
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
</style>
