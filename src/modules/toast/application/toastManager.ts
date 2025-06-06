/**
 * Toast Manager
 *
 * Central manager for the intelligent toast system.
 * Handles toast creation, queue management, and integration with solid-toast.
 */

import {
  enqueue,
  createToastItem,
  dequeueById,
} from '~/modules/toast/application/toastQueue'
import {
  ToastOptions,
  DEFAULT_TOAST_OPTIONS,
  TOAST_DURATION_INFINITY,
  DEFAULT_TOAST_CONTEXT,
} from '~/modules/toast/domain/toastTypes'
import { processErrorMessage } from '~/modules/toast/domain/errorMessageHandler'

const MAX_ERROR_MESSAGE_LENGTH = 100

/**
 * Creates and enqueues a toast notification with merged options.
 *
 * @param message - The message to display in the toast.
 * @param options - Toast options to override defaults and control behavior.
 * @returns {string} The ID of the created toast.
 */
function createAndEnqueueToast(message: string, options: ToastOptions): string {
  return enqueue(createToastItem(message, options))
}

/**
 * Returns true if the toast should be skipped based on context, audience, and type.
 *
 * @param options - ToastOptions including context, audience, level, showSuccess, showLoading.
 * @returns True if the toast should be skipped, false otherwise.
 */
function shouldSkipToast(options: ToastOptions): boolean {
  const { context, audience, level, showSuccess, showLoading } = options

  // Always show error toasts
  if (level === 'error') return false

  const isBackgroundOrSystem = context === 'background' || audience === 'system'

  if (level === 'success' && isBackgroundOrSystem && showSuccess !== true) {
    return true
  }

  if (level === 'info' && isBackgroundOrSystem && showLoading !== true) {
    return true
  }

  return false
}

/**
 * Returns a filtered copy of the toast messages object, never mutating the original.
 * Filters out loading and success messages for background/system context and audience unless explicitly enabled.
 *
 * @template T
 * @param messages - Toast messages for loading, success, and error.
 * @param options - Toast options, may include context and audience.
 * @returns Filtered messages object.
 */
function filterBackgroundPromiseMessages<T>(
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
): typeof messages {
  const context = options?.context ?? DEFAULT_TOAST_CONTEXT
  const mergedOptions = { ...DEFAULT_TOAST_OPTIONS[context], ...options }

  return {
    loading: !shouldSkipToast({ ...mergedOptions, level: 'info' })
      ? messages.loading
      : undefined,
    success: !shouldSkipToast({ ...mergedOptions, level: 'success' })
      ? messages.success
      : undefined,
    error: !shouldSkipToast({ ...mergedOptions, level: 'error' })
      ? messages.error
      : undefined,
  }
}

/**
 * Checks if a value is a non-empty string.
 *
 * @param val - Value to check.
 * @returns {boolean} True if value is a non-empty string.
 */
function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0
}

/**
 * Resolves a value or a function with the provided argument.
 * If valueOrFn is a function, calls it with arg; otherwise, returns valueOrFn.
 *
 * @template T, R
 * @param valueOrFn - Value or function to resolve.
 * @param arg - Argument to pass if valueOrFn is a function.
 * @returns The resolved value or undefined.
 */
function resolveValueOrFunction<T, R>(
  valueOrFn: R | ((arg: T) => R) | undefined,
  arg: T,
): R | undefined {
  if (valueOrFn === undefined) return undefined
  if (typeof valueOrFn === 'function') return (valueOrFn as (arg: T) => R)(arg)
  return valueOrFn
}

/**
 * Shows a toast with merged options, skipping if context rules apply.
 *
 * @param message - The message to display.
 * @param providedOptions - Partial toast options.
 * @returns The toast ID, or empty string if skipped.
 */
function show(message: string, providedOptions: Partial<ToastOptions>): string {
  const context = providedOptions.context ?? DEFAULT_TOAST_CONTEXT
  const options: ToastOptions = {
    ...DEFAULT_TOAST_OPTIONS[context],
    ...providedOptions,
  }
  if (shouldSkipToast(options)) return ''
  return createAndEnqueueToast(message, options)
}

/**
 * Shows an error toast, processing the error for display and truncation.
 *
 * @param error - The error to display.
 * @param providedOptions - Partial toast options (except level).
 * @returns The toast ID.
 */
export function showError(
  error: unknown,
  providedOptions?: Omit<Partial<ToastOptions>, 'level'>,
): string {
  const options = {
    level: 'error' as const,
    ...providedOptions,
  }

  const { maxLength = MAX_ERROR_MESSAGE_LENGTH } = options

  // Ensure error is a string for display
  const errorMessage = typeof error === 'string' ? error : String(error)

  const processed = processErrorMessage(errorMessage, {
    maxLength,
    includeStack: true,
  })

  return show(processed.displayMessage, {
    ...options,
    expandableErrorData: {
      isTruncated: processed.isTruncated,
      errorDetails: processed.errorDetails,
      canExpand: processed.canExpand,
    },
  })
}

/**
 * Shows a success toast.
 *
 * @param message - The message to display.
 * @param providedOptions - Partial toast options (except level).
 * @returns {string} The toast ID.
 */
export function showSuccess(
  message: string,
  providedOptions?: Omit<Partial<ToastOptions>, 'level'>,
): string {
  const options = {
    level: 'success' as const,
    ...providedOptions,
  }

  return show(message, options)
}

/**
 * Shows a loading toast with infinite duration.
 *
 * @param message - The message to display.
 * @param providedOptions - Partial toast options (except level).
 * @returns {string} The toast ID.
 */
export function showLoading(
  message: string,
  providedOptions?: Omit<Partial<ToastOptions>, 'level'>,
): string {
  const options = {
    duration: TOAST_DURATION_INFINITY, // Infinite duration for loading
    level: 'info' as const,
    ...providedOptions,
  }

  return show(message, options)
}

function handlePromiseSuccess<T>(
  data: T,
  filteredMessages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
) {
  const successMsg = resolveValueOrFunction(filteredMessages.success, data)
  if (isNonEmptyString(successMsg)) {
    showSuccess(successMsg, options)
  }
}

function handlePromiseError<T>(
  err: unknown,
  filteredMessages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
) {
  const errorMsg = resolveValueOrFunction(filteredMessages.error, err)
  if (isNonEmptyString(errorMsg)) {
    showError(errorMsg, options)
  } else {
    showError(err, options)
  }
}

function removeLoadingToast(loadingToastId: string | null) {
  if (typeof loadingToastId === 'string' && loadingToastId.length > 0) {
    dequeueById(loadingToastId)
  }
}

/**
 * Handles a promise with context-aware toast notifications for loading, success, and error states.
 * Shows a loading toast while the promise is pending (unless suppressed).
 * Replaces loading with success or error toast on resolution/rejection.
 * Skips toasts in background context unless explicitly enabled.
 * Supports static or function messages for success and error.
 *
 * @template T
 * @param promise - The promise to monitor.
 * @param messages - Toast messages for loading, success, and error. Success and error can be strings or functions.
 * @param options - Additional toast options.
 * @returns {Promise<T>} The resolved value of the promise.
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
): Promise<T> {
  const filteredMessages = filterBackgroundPromiseMessages(messages, options)
  let loadingToastId: string | null = null
  if (isNonEmptyString(filteredMessages.loading)) {
    loadingToastId = showLoading(filteredMessages.loading, options)
  }
  return promise
    .then((data) => {
      handlePromiseSuccess(data, filteredMessages, options)
      return data
    })
    .catch((err: unknown) => {
      handlePromiseError(err, filteredMessages, options)
      throw err
    })
    .finally(() => {
      removeLoadingToast(loadingToastId)
    })
}
