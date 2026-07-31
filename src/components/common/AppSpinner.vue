<template>
  <div
    class="spinner"
    :style="{ width: size + 'px', height: size + 'px', borderWidth: borderWidth + 'px' }"
    role="status"
    aria-label="Loading"
  ></div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 40 })

const borderWidth = props.size >= 48 ? 4 : 3
</script>

<style scoped>
.spinner {
  border: 4px solid #e0e0e0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
