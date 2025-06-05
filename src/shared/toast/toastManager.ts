/**
 * Toast Manager
 *
 * Central manager for the intelligent toast system.
 * Handles toast creation, queue management, and integration with solid-toast.
 */

import toast from 'solid-toast'
import { enqueue, createToastItem, dequeue, clear } from './toastQueue'
import {
  ToastOptions,
  ToastContext,
  ToastLevel,
  DEFAULT_TOAST_OPTIONS,
} from './toastConfig'
import { getUserFriendlyMessage } from './errorMessageHandler'

/**
 * Display a toast in solid-toast with the appropriate styling
 */
function displayToast(message: string, level: ToastLevel): void {
  switch (level) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'warning':
      // solid-toast doesn't have warning, use custom or error styling
      toast(message, {
        style: {
          background: '#f59e0b',
          color: 'white',
        },
      })
      break
    case 'info':
    default:
      toast(message)
      break
  }
}

/**
 * Show a toast with intelligent filtering and queue management
 */
export function show(
  message: string,
  level: ToastLevel = 'info',
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  const defaultOptions = DEFAULT_TOAST_OPTIONS[context]
  const finalOptions: ToastOptions = {
    context,
    level,
    ...defaultOptions,
    ...options,
  }

  // Skip background toasts for success/info unless explicitly enabled
  if (
    context === 'background' &&
    (level === 'success' || level === 'info') &&
    finalOptions.showSuccess !== true
  ) {
    console.debug('[ToastManager] Skipping background toast:', message)
    return
  }

  const toastItem = createToastItem(message, finalOptions)

  // Add to queue for controlled display
  enqueue(toastItem)

  // Show in solid-toast immediately (queue will handle sequencing)
  displayToast(message, level)
}

/**
 * Show an error toast with intelligent message processing
 */
export function showError(
  error: unknown,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  const finalOptions: ToastOptions = {
    context,
    level: 'error',
    ...DEFAULT_TOAST_OPTIONS[context],
    ...options,
  }

  const userFriendlyMessage = getUserFriendlyMessage(error)

  show(userFriendlyMessage, 'error', context, finalOptions)
}

/**
 * Show success toast (typically for user actions)
 */
export function showSuccess(
  message: string,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  show(message, 'success', context, options)
}

/**
 * Show info toast
 */
export function showInfo(
  message: string,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  show(message, 'info', context, options)
}

/**
 * Show warning toast
 */
export function showWarning(
  message: string,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  show(message, 'warning', context, options)
}

/**
 * Smart promise toast handler with context-aware behavior
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): Promise<T> {
  const finalOptions = {
    ...DEFAULT_TOAST_OPTIONS[context],
    ...options,
  }

  // For background operations, don't show loading/success unless explicitly enabled
  if (context === 'background') {
    if (finalOptions.showLoading !== true) {
      messages.loading = undefined
    }
    if (finalOptions.showSuccess !== true) {
      messages.success = undefined
    }
  }

  // Use solid-toast's promise handler
  return toast.promise(promise, {
    loading: messages.loading ?? 'Loading...',
    success: (data) => {
      const successMsg =
        typeof messages.success === 'function'
          ? messages.success(data)
          : (messages.success ?? 'Success!')

      if (successMsg) {
        const toastItem = createToastItem(successMsg, {
          ...finalOptions,
          level: 'success',
        })
        enqueue(toastItem)
      }

      return successMsg
    },
    error: (error) => {
      const userFriendlyMessage = getUserFriendlyMessage(error)

      const toastItem = createToastItem(userFriendlyMessage, {
        ...finalOptions,
        level: 'error',
      })
      enqueue(toastItem)

      return userFriendlyMessage
    },
  })
}

/**
 * Clear all toasts
 */
export function clearAll(): void {
  clear()
  toast.dismiss()
}

/**
 * Dismiss current toast and move to next in queue
 */
export function dismiss(): void {
  dequeue()
  toast.dismiss()
}

// Legacy class-based interface for backward compatibility
export class ToastManager {
  show = show
  showError = showError
  showSuccess = showSuccess
  showInfo = showInfo
  showWarning = showWarning
  showPromise = showPromise
  clearAll = clearAll
  dismiss = dismiss
}

// Default instance for convenience
export const toastManager = new ToastManager()
