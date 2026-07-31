<template>
  <div class="toast-container" role="alert" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
      @click="removeToast(toast.id)"
    >
      <span class="toast-icon" aria-hidden="true">{{ toast.icon }}</span>
      <span class="toast-message">{{ toast.message }}</span>
      <button
        class="toast-close"
        @click.stop="removeToast(toast.id)"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  width: calc(100% - 40px);
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  cursor: pointer;
  transition: transform 0.2s;
}

.toast:hover {
  transform: scale(1.02);
}

.toast.error { background: #dc3545; }
.toast.success { background: #28a745; }
.toast.warning { background: #ffc107; color: #333; }
.toast.info { background: #17a2b8; }

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  word-break: break-word;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
  line-height: 1;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
