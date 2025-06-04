/**
 * Toast Manager
 *
 * Central manager for the intelligent toast system.
 * Handles toast creation, queue management, and integration with solid-toast.
 */

import toast from 'solid-toast'
import { ToastQueue, getToastQueue, createToastItem } from './toastQueue'
import {
  ToastOptions,
  ToastContext,
  ToastLevel,
  DEFAULT_TOAST_OPTIONS,
  ToastError,
} from './toastConfig'
import {
  processErrorMessage,
  getUserFriendlyMessage,
} from './errorMessageHandler'

/**
 * Options for toast promise operations
 */
export type ToastPromiseOptions<T> = {
  /** Loading message */
  loading?: string
  /** Success message or function to generate message from result */
  success?: string | ((data: T) => string)
  /** Error message or function to generate message from error */
  error?: string | ((error: unknown) => string)
  /** Toast context */
  context?: ToastContext
  /** Additional toast options */
  options?: Partial<ToastOptions>
}

/**
 * Central Toast Manager Class
 * Provides intelligent toast management with queue control and context awareness
 */
export class ToastManager {
  private queue: ToastQueue

  constructor() {
    this.queue = getToastQueue()
  }

  /**
   * Show a simple toast message
   */
  show(
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
      !finalOptions.showSuccess
    ) {
      console.debug('[ToastManager] Skipping background toast:', message)
      return
    }

    const toastItem = createToastItem(message, finalOptions)

    // Use queue for controlled display
    this.queue.enqueue(toastItem)

    // Show in solid-toast
    this.displayToast(toastItem)
  }

  /**
   * Show an error toast with intelligent message processing
   */
  showError(
    error: unknown,
    context: ToastContext = 'user-action',
    options: Partial<ToastOptions> = {},
  ): void {
    const processedError = processErrorMessage(error, {
      maxLength:
        options.maxLength || DEFAULT_TOAST_OPTIONS[context]?.maxLength || 100,
    })

    const finalOptions: ToastOptions = {
      context,
      level: 'error',
      ...DEFAULT_TOAST_OPTIONS[context],
      ...options,
      duration: 0, // Errors should be manually dismissed
    }

    // Use user-friendly message for display
    const displayMessage = processedError.canExpand
      ? processedError.displayMessage
      : getUserFriendlyMessage(error)

    const toastItem = createToastItem(displayMessage, finalOptions)

    this.queue.enqueue(toastItem)

    // Show expandable error toast if truncated or has details
    if (processedError.canExpand) {
      this.displayExpandableErrorToast(toastItem, processedError.errorDetails)
    } else {
      this.displayToast(toastItem)
    }
  }

  /**
   * Show toast for promise operations with intelligent context handling
   */
  async showPromise<T>(
    promise: Promise<T>,
    promiseOptions: ToastPromiseOptions<T>,
  ): Promise<T> {
    const context = promiseOptions.context || 'user-action'
    const defaultOptions = DEFAULT_TOAST_OPTIONS[context]

    // Skip loading/success for background operations unless explicitly enabled
    const shouldShowLoading =
      promiseOptions.loading &&
      (context !== 'background' || defaultOptions?.showLoading)
    const shouldShowSuccess =
      promiseOptions.success &&
      (context !== 'background' || defaultOptions?.showSuccess)

    try {
      let loadingToastId: string | undefined

      // Show loading toast if appropriate
      if (shouldShowLoading) {
        loadingToastId = toast.loading(promiseOptions.loading)
      }

      // Wait for promise to resolve
      const result = await promise

      // Dismiss loading toast
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }

      // Show success toast if appropriate
      if (shouldShowSuccess) {
        const successMessage =
          typeof promiseOptions.success === 'function'
            ? promiseOptions.success(result)
            : promiseOptions.success!

        this.show(successMessage, 'success', context, promiseOptions.options)
      }

      return result
    } catch (error) {
      // Dismiss loading toast
      if (shouldShowLoading) {
        toast.dismiss()
      }

      // Generate error message
      const errorMessage = promiseOptions.error
        ? typeof promiseOptions.error === 'function'
          ? promiseOptions.error(error)
          : promiseOptions.error
        : getUserFriendlyMessage(error)

      // Show error toast
      this.showError(error, context, {
        ...promiseOptions.options,
        // Override message if provided
        ...(promiseOptions.error && { maxLength: errorMessage.length + 20 }),
      })

      throw error
    }
  }

  /**
   * Show success toast
   */
  success(
    message: string,
    context: ToastContext = 'user-action',
    options: Partial<ToastOptions> = {},
  ): void {
    this.show(message, 'success', context, options)
  }

  /**
   * Show warning toast
   */
  warning(
    message: string,
    context: ToastContext = 'user-action',
    options: Partial<ToastOptions> = {},
  ): void {
    this.show(message, 'warning', context, options)
  }

  /**
   * Show info toast
   */
  info(
    message: string,
    context: ToastContext = 'user-action',
    options: Partial<ToastOptions> = {},
  ): void {
    this.show(message, 'info', context, options)
  }

  /**
   * Dismiss current toast
   */
  dismiss(): void {
    toast.dismiss()
    this.queue.dequeue()
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    toast.dismiss()
    this.queue.clear()
  }

  /**
   * Get queue status for debugging
   */
  getStatus() {
    return this.queue.getStatus()
  }

  /**
   * Display a regular toast using solid-toast
   */
  private displayToast(toastItem: any): void {
    const toastOptions = {
      duration: toastItem.options.duration,
      id: toastItem.id,
      dismissible: toastItem.options.dismissible,
    }

    switch (toastItem.options.level) {
      case 'success':
        toast.success(toastItem.message, toastOptions)
        break
      case 'error':
        toast.error(toastItem.message, toastOptions)
        break
      case 'warning':
        toast.error(toastItem.message, toastOptions) // Use error style for warnings
        break
      case 'info':
      default:
        toast(toastItem.message, toastOptions)
        break
    }
  }

  /**
   * Display an expandable error toast (to be implemented with component)
   */
  private displayExpandableErrorToast(
    toastItem: any,
    errorDetails: ToastError,
  ): void {
    // For now, display as regular error toast
    // This will be enhanced when we create the ExpandableErrorToast component
    const toastOptions = {
      duration: 0, // Manual dismiss for errors
      id: toastItem.id,
    }

    // Add instruction to copy error details (temporarily until we have the component)
    const enhancedMessage = toastItem.options.maxLength
      ? `${toastItem.message} - Error details available in console`
      : toastItem.message

    // Log error details to console for now
    console.group('🚨 Toast Error Details')
    console.error('Message:', toastItem.message)
    console.error('Full Error:', errorDetails.fullError || errorDetails.message)
    console.error('Stack:', errorDetails.stack)
    console.error('Context:', errorDetails.context)
    console.groupEnd()

    toast.error(enhancedMessage, toastOptions)
  }
}

/**
 * Singleton instance for global toast management
 */
let globalToastManager: ToastManager | null = null

/**
 * Get or create the global toast manager instance
 */
export function getToastManager(): ToastManager {
  if (!globalToastManager) {
    globalToastManager = new ToastManager()
  }
  return globalToastManager
}

/**
 * Reset the global toast manager (mainly for testing)
 */
export function resetToastManager(): void {
  globalToastManager = null
}

// Export convenience functions for easy use
const manager = getToastManager()

export const smartToast = {
  show: (
    message: string,
    level?: ToastLevel,
    context?: ToastContext,
    options?: Partial<ToastOptions>,
  ) => manager.show(message, level, context, options),
  success: (
    message: string,
    context?: ToastContext,
    options?: Partial<ToastOptions>,
  ) => manager.success(message, context, options),
  error: (
    error: unknown,
    context?: ToastContext,
    options?: Partial<ToastOptions>,
  ) => manager.showError(error, context, options),
  warning: (
    message: string,
    context?: ToastContext,
    options?: Partial<ToastOptions>,
  ) => manager.warning(message, context, options),
  info: (
    message: string,
    context?: ToastContext,
    options?: Partial<ToastOptions>,
  ) => manager.info(message, context, options),
  promise: <T>(promise: Promise<T>, options: ToastPromiseOptions<T>) =>
    manager.showPromise(promise, options),
  dismiss: () => manager.dismiss(),
  clear: () => manager.clear(),
}
