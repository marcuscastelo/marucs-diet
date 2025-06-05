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
 * Helper to determine if a toast should be skipped in background context
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
 * Helper to filter loading/success messages for background context
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
 * Helper to check if a value is a non-empty string
 */
function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0
}

/**
 * Helper to resolve the success message for a promise toast
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
 * Helper to resolve the error message for a promise toast
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
  if (shouldSkipBackgroundToast(level, context, finalOptions)) {
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
