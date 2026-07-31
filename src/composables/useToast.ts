import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const store = useToastStore()

  return {
    toasts: store.toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearToasts: store.clearToasts,
    showError: (message: string, duration?: number) => store.addToast(message, 'error', duration),
    showSuccess: (message: string, duration?: number) => store.addToast(message, 'success', duration),
    showWarning: (message: string, duration?: number) => store.addToast(message, 'warning', duration),
    showInfo: (message: string, duration?: number) => store.addToast(message, 'info', duration),
  }
}