import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'error' | 'success' | 'warning' | 'info'
  icon: string
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function addToast(message: string, type: Toast['type'] = 'error', duration: number = 4000) {
    const icons = {
      error: '❌',
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️'
    }

    const toast: Toast = {
      id: nextId++,
      message,
      type,
      icon: icons[type],
      duration
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, duration)
    }

    return toast.id
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearToasts() {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts
  }
})