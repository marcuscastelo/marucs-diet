import toast from 'solid-toast'

/**
 * Dismiss a toast by its solid-toast ID
 */
export function dismissToast(solidToastId: string): void {
  toast.dismiss(solidToastId)
}
