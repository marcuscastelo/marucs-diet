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
import { processErrorMessage } from './errorMessageHandler'

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
 * Resolves a value or function with the provided argument.
 *
 * Usage examples:
 *
 * // Example 1: Passing a string value
 * const result1 = resolveValueOrFunction('Hello', 123)
 * // result1 === 'Hello'
 *
 * // Example 2: Passing a function
 * const result2 = resolveValueOrFunction((n: number) => `Value: ${n}` , 42)
 * // result2 === 'Value: 42'
 *
 * // Example 3: Passing undefined
 * const result3 = resolveValueOrFunction(undefined, 'ignored')
 * // result3 === undefined
 *
 * @param valueOrFn - A value or a function to resolve.
 * @param arg - The argument to pass if valueOrFn is a function.
 * @returns The resolved value, or undefined if not set.
 */
function resolveValueOrFunction<T, R>(
  valueOrFn: R | ((arg: T) => R) | undefined,
  arg: T,
): R | undefined {
  if (valueOrFn === undefined) return undefined
  return typeof valueOrFn === 'function'
    ? (valueOrFn as (arg: T) => R)(arg)
    : valueOrFn
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
): string {
  const defaultOptions = DEFAULT_TOAST_OPTIONS[context]
  const finalOptions: ToastOptions = {
    context,
    level,
    ...defaultOptions,
    ...options,
  }
  if (shouldSkipBackgroundToast(level, context, finalOptions)) {
    console.debug('[ToastManager] Skipping background toast:', message)
    return ''
  }
  return createAndEnqueueToast(message, level, context, options)
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
): string {
  const defaultOptions = DEFAULT_TOAST_OPTIONS[context]
  const finalOptions: ToastOptions = {
    context,
    level: 'error',
    ...defaultOptions,
    ...options,
  }
  // Use processErrorMessage to handle truncation for error toasts
  const processed = processErrorMessage(error as string, {
    maxLength: finalOptions.maxLength ?? 100,
    includeStack: true, // Include stack for expandable error toast
  })

  const duration =
    finalOptions.duration ?? (processed.isTruncated ? 8000 : 5000)

  return show(processed.displayMessage, 'error', context, {
    ...options,
    duration,
    dismissible: true,
    expandableErrorData: {
      isTruncated: processed.isTruncated,
      errorDetails: processed.errorDetails,
    },
  })
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
): string {
  return show(message, 'success', context, options)
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
): string {
  return show(message, 'info', context, options)
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
): string {
  return show(message, 'warning', context, options)
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
  // Show loading toast if enabled and store its ID for precise removal
  let loadingToastId: string | null = null
  if (isNonEmptyString(messages.loading)) {
    const loadingOptions = { ...options, duration: 0 }
    loadingToastId = show(messages.loading, 'info', context, loadingOptions)
  }

  // Use our custom promise handling instead of solid-toast
  return promise
    .then((data) => {
      // Show success toast if enabled
      const successMsg = resolveValueOrFunction(messages.success, data)
      if (isNonEmptyString(successMsg)) {
        showSuccess(successMsg, context, options)
      }
      return data
    })
    .catch((err: unknown) => {
      // Show error toast
      const errorMsg = resolveValueOrFunction(messages.error, err)
      if (isNonEmptyString(errorMsg)) {
        showError(err, context, options)
      }
      throw err
    })
    .finally(() => {
      // Remove the specific loading toast if it exists
      if (typeof loadingToastId === 'string' && loadingToastId.length > 0) {
        dequeueById(loadingToastId)
      }
    })
}
