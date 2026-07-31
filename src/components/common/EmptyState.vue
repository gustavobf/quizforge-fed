<template>
  <div class="empty-state">
    <span class="empty-icon" aria-hidden="true">{{ icon }}</span>
    <p class="empty-message">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; message?: string }>(), {
  icon: '📭',
  message: 'No data available',
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-message {
  margin-bottom: 16px;
  font-size: 15px;
}
</style>
