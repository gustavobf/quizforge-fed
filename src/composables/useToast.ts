import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const toastStore = useToastStore()

  const showError = (message: string, duration?: number) => {
    toastStore.addToast(message, 'error', duration)
  }

  const showSuccess = (message: string, duration?: number) => {
    toastStore.addToast(message, 'success', duration)
  }

  const showWarning = (message: string, duration?: number) => {
    toastStore.addToast(message, 'warning', duration)
  }

  const showInfo = (message: string, duration?: number) => {
    toastStore.addToast(message, 'info', duration)
  }

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}