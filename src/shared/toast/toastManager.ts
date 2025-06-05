/**
 * Toast Manager
 *
 * Central manager for the intelligent toast system.
 * Handles toast creation, queue management, and integration with solid-toast.
 */

import {
  enqueue,
  createToastItem,
  dequeue,
  dequeueById,
  clear,
} from './toastQueue'
import {
  ToastOptions,
  ToastContext,
  ToastLevel,
  DEFAULT_TOAST_OPTIONS,
} from './toastConfig'
import { getUserFriendlyMessage } from './errorMessageHandler'

/**
 * Internal helper to create and enqueue a toast with merged options
 */
function createAndEnqueueToast(
  message: string,
  level: ToastLevel,
  context: ToastContext,
  options: Partial<ToastOptions> = {},
): string {
  const defaultOptions = DEFAULT_TOAST_OPTIONS[context]
  const finalOptions: ToastOptions = {
    context,
    level,
    ...defaultOptions,
    ...options,
  }
  const toastItem = createToastItem(message, finalOptions)
  return enqueue(toastItem)
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
  // Skip background toasts for success/info unless explicitly enabled
  const defaultOptions = DEFAULT_TOAST_OPTIONS[context]
  const finalOptions: ToastOptions = {
    context,
    level,
    ...defaultOptions,
    ...options,
  }
  if (
    context === 'background' &&
    (level === 'success' || level === 'info') &&
    finalOptions.showSuccess !== true
  ) {
    console.debug('[ToastManager] Skipping background toast:', message)
    return
  }
  createAndEnqueueToast(message, level, context, options)
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
  // Show loading toast if enabled and store its ID for precise removal
  let loadingToastId: string | null = null
  const loadingMessage = messages.loading
  if (loadingMessage !== undefined && loadingMessage.length > 0) {
    loadingToastId = createAndEnqueueToast(loadingMessage, 'info', context, {
      ...finalOptions,
      duration: 0, // Loading toast should not auto-dismiss
    })
  }
  // Use our custom promise handling instead of solid-toast
  return promise
    .then((data) => {
      // Remove the specific loading toast if it exists
      if (loadingToastId !== null) {
        dequeueById(loadingToastId)
      }
      // Show success toast if enabled
      const successMsg =
        typeof messages.success === 'function'
          ? messages.success(data)
          : messages.success
      if (
        successMsg !== undefined &&
        successMsg !== null &&
        successMsg.length > 0
      ) {
        createAndEnqueueToast(successMsg, 'success', context, finalOptions)
      }
      return data
    })
    .catch((error: unknown) => {
      // Remove the specific loading toast if it exists
      if (loadingToastId !== null) {
        dequeueById(loadingToastId)
      }
      // Show error toast
      let errorMsg: string
      if (messages.error !== undefined) {
        if (typeof messages.error === 'function') {
          errorMsg = messages.error(error)
        } else {
          errorMsg = messages.error
        }
      } else {
        errorMsg = getUserFriendlyMessage(error)
      }
      createAndEnqueueToast(errorMsg, 'error', context, finalOptions)
      throw error
    })
}

/**
 * Clear all toasts
 */
export function clearAll(): void {
  clear()
}

/**
 * Dismiss current toast and move to next in queue
 */
export function dismiss(): void {
  dequeue()
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
