<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
      @click="removeToast(toast.id)"
    >
      <span class="toast-icon">{{ toast.icon }}</span>
      <span class="toast-message">{{ toast.message }}</span>
      <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore'
import { storeToRefs } from 'pinia'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore
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
  width: 100%;
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

.toast.error {
  background: #dc3545;
}

.toast.success {
  background: #28a745;
}

.toast.warning {
  background: #ffc107;
  color: #333;
}

.toast.info {
  background: #17a2b8;
}

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
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
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

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast-exit {
  animation: slideOut 0.3s ease forwards;
}
</style>