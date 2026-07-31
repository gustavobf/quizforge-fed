import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'error' | 'success' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  icon: string
  duration?: number
}

const TOAST_ICONS: Record<ToastType, string> = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function addToast(message: string, type: ToastType = 'error', duration = 4000): number {
    const toast: Toast = {
      id: nextId++,
      message,
      type,
      icon: TOAST_ICONS[type],
      duration,
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => removeToast(toast.id), duration)
    }

    return toast.id
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearToasts() {
    toasts.value = []
  }

  return { toasts, addToast, removeToast, clearToasts }
})
