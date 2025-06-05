/**
 * Toast Manager
 *
 * Central manager for the intelligent toast system.
 * Handles toast creation, queue management, and integration with solid-toast.
 */

import { enqueue, createToastItem, dequeueById } from './toastQueue'
import {
  ToastOptions,
  ToastContext,
  ToastLevel,
  DEFAULT_TOAST_OPTIONS,
} from './toastConfig'
import {
  getUserFriendlyMessage,
  processErrorMessage,
} from './errorMessageHandler'

/**
 * Creates and enqueues a toast notification with merged options.
 *
 * @param message - The message to display in the toast.
 * @param level - The toast level ('info', 'success', 'error', 'warning').
 * @param context - The toast context ('user-action' or 'background').
 * @param options - Additional toast options to override defaults.
 * @returns The ID of the created toast.
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
 * Determines if a toast should be skipped in background context based on level and options.
 *
 * @param level - The toast level ('info', 'success', etc.).
 * @param context - The toast context ('user-action' or 'background').
 * @param options - Toast options, merged with defaults.
 * @returns True if the toast should be skipped, false otherwise.
 */
function shouldSkipBackgroundToast(
  level: ToastLevel,
  context: ToastContext,
  options: Partial<ToastOptions>,
): boolean {
  // Defensive: fallback to 'user-action' if context is undefined
  const ctx: ToastContext = context ?? 'user-action'
  const opts = {
    ...DEFAULT_TOAST_OPTIONS[ctx],
    ...options,
    context: ctx,
    level,
  }
  return (
    ctx === 'background' &&
    (level === 'success' || level === 'info') &&
    opts.showSuccess !== true
  )
}

/**
 * Filters out loading and success messages for background context if not explicitly enabled.
 *
 * Mutates the messages object to set loading/success to undefined if background context and not allowed.
 *
 * @param messages - The toast messages object (loading, success, error).
 * @param context - The toast context.
 * @param options - Toast options.
 */
function filterBackgroundPromiseMessages<T>(
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  context: ToastContext,
  options: Partial<ToastOptions>,
): void {
  const optsInfo = {
    ...DEFAULT_TOAST_OPTIONS[context],
    ...options,
    context,
    level: 'info' as ToastLevel,
  }
  const optsSuccess = {
    ...DEFAULT_TOAST_OPTIONS[context],
    ...options,
    context,
    level: 'success' as ToastLevel,
  }
  if (shouldSkipBackgroundToast('info', context, optsInfo)) {
    messages.loading = undefined
  }
  if (shouldSkipBackgroundToast('success', context, optsSuccess)) {
    messages.success = undefined
  }
}

/**
 * Checks if a value is a non-empty string.
 *
 * @param val - The value to check.
 * @returns True if the value is a non-empty string, false otherwise.
 */
function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0
}

/**
 * Resolves the success message for a promise toast, supporting string or function.
 *
 * @param data - The resolved data from the promise.
 * @param messages - The toast messages object.
 * @returns The resolved success message, or undefined if not set.
 */
function resolveSuccessMessage<T>(
  data: T,
  messages: { success?: string | ((data: T) => string) },
): string | undefined {
  if (messages.success === undefined) return undefined
  return typeof messages.success === 'function'
    ? messages.success(data)
    : messages.success
}

/**
 * Resolves the error message for a promise toast, supporting string or function.
 * Falls back to a user-friendly message if not set.
 *
 * @param error - The error thrown by the promise.
 * @param messages - The toast messages object.
 * @returns The resolved error message.
 */
function resolveErrorMessage(
  error: unknown,
  messages: { error?: string | ((error: unknown) => string) },
): string {
  if (messages.error !== undefined) {
    return typeof messages.error === 'function'
      ? messages.error(error)
      : messages.error
  }
  return getUserFriendlyMessage(error)
}

/**
 * Shows a toast notification with intelligent filtering and queue management.
 *
 * - Skips background toasts for 'info' and 'success' unless explicitly enabled.
 * - Merges default and custom options.
 *
 * @param message - The message to display.
 * @param level - The toast level ('info', 'success', 'error', 'warning').
 * @param context - The toast context ('user-action' or 'background').
 * @param options - Additional toast options.
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
  if (shouldSkipBackgroundToast(level, context, finalOptions)) {
    console.debug('[ToastManager] Skipping background toast:', message)
    return
  }
  createAndEnqueueToast(message, level, context, options)
}

/**
 * Shows an error toast with intelligent message processing.
 *
 * - Converts unknown errors to user-friendly messages.
 * - Uses the error toast level and merges options.
 *
 * @param error - The error to display.
 * @param context - The toast context.
 * @param options - Additional toast options.
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

  // Use processErrorMessage to handle truncation
  const processed = processErrorMessage(error, {
    maxLength: finalOptions.maxLength ?? 100,
    includeStack: true, // Include stack for expandable error toast
  })

  // Inline logic from showExpandableErrorToast
  const duration =
    finalOptions.duration ?? (processed.isTruncated ? 8000 : 5000)
  const toastItem = createToastItem(processed.displayMessage, {
    level: 'error',
    context: 'user-action',
    duration,
    dismissible: true,
    expandableErrorData: {
      isTruncated: processed.isTruncated,
      errorDetails: processed.errorDetails,
      // onDismiss/onCopy can be added if needed
    },
  })
  enqueue(toastItem)
}

/**
 * Shows a success toast, typically for user actions.
 *
 * @param message - The message to display.
 * @param context - The toast context.
 * @param options - Additional toast options.
 */
export function showSuccess(
  message: string,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  show(message, 'success', context, options)
}

/**
 * Shows an info toast.
 *
 * @param message - The message to display.
 * @param context - The toast context.
 * @param options - Additional toast options.
 */
export function showInfo(
  message: string,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  show(message, 'info', context, options)
}

/**
 * Shows a warning toast.
 *
 * @param message - The message to display.
 * @param context - The toast context.
 * @param options - Additional toast options.
 */
export function showWarning(
  message: string,
  context: ToastContext = 'user-action',
  options: Partial<ToastOptions> = {},
): void {
  show(message, 'warning', context, options)
}

/**
 * Handles a promise with context-aware toast notifications for loading, success, and error states.
 *
 * - Shows a loading toast while the promise is pending (unless suppressed).
 * - Replaces loading with success or error toast on resolution/rejection.
 * - Skips toasts in background context unless explicitly enabled.
 * - Supports static or function messages for success and error.
 *
 * @param promise - The promise to monitor.
 * @param messages - Toast messages for loading, success, and error. Success and error can be strings or functions.
 * @param context - The toast context ('user-action' or 'background').
 * @param options - Additional toast options.
 * @returns The resolved value of the promise.
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
  filterBackgroundPromiseMessages(messages, context, options)
  const finalOptions = { ...DEFAULT_TOAST_OPTIONS[context], ...options }
  // Show loading toast if enabled and store its ID for precise removal
  let loadingToastId: string | null = null
  const loadingMessage = messages.loading
  if (isNonEmptyString(loadingMessage)) {
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
      const successMsg = resolveSuccessMessage(data, messages)
      if (isNonEmptyString(successMsg)) {
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
      const errorMsg = resolveErrorMessage(error, messages)
      if (isNonEmptyString(errorMsg)) {
        createAndEnqueueToast(errorMsg, 'error', context, finalOptions)
      }
      throw error
    })
}
