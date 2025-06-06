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

/**
 * Creates and enqueues a toast notification with merged options.
 *
 * @param message - The message to display in the toast.
 * @param level - The toast level ('info', 'success', 'error', 'warning').
 * @param context - The toast context ('user-action' or 'background').
 * @param options - Additional toast options to override defaults.
 * @returns The ID of the created toast.
 */
function createAndEnqueueToast(message: string, options: ToastOptions): string {
  const toastItem = createToastItem(message, options)

  const toastId = enqueue(toastItem)

  return toastId
}

/**
 * Determines if a toast should be skipped in background context based on level and options.
 *
 * @param level - The toast level ('info', 'success', etc.).
 * @param context - The toast context ('user-action' or 'background').
 * @param options - Toast options, merged with defaults.
 * @returns True if the toast should be skipped, false otherwise.
 */
function shouldSkipBackgroundToast(options: ToastOptions): boolean {
  const opts = {
    ...DEFAULT_TOAST_OPTIONS[options.context ?? 'user-action'],
    ...options,
  }

  const ctx = opts.context
  const level = opts.level

  return (
    ctx === 'background' &&
    (level === 'success' || level === 'info') &&
    opts.showSuccess !== true
  )
}

/**
 * Returns a filtered copy of the toast messages object, never mutating the original.
 * Filters out loading and success messages for background context if not explicitly enabled.
 */
function filterBackgroundPromiseMessages<T>(
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
): typeof messages {
  // Otherwise, return the original messages
  return messages
}

/**
 * Checks if a value is a non-empty string.
 */
function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0
}

/**
 * Resolves a value or function with the provided argument.
 * Returns the value if not a function, or the result of the function if it is.
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

function show(message: string, providedOptions: Partial<ToastOptions>): string {
  const context = providedOptions.context ?? DEFAULT_TOAST_CONTEXT
  const defaultOptions = DEFAULT_TOAST_OPTIONS[context]
  const options: ToastOptions = {
    ...defaultOptions,
    ...providedOptions,
  }
  if (shouldSkipBackgroundToast(options)) {
    return ''
  }
  return createAndEnqueueToast(message, options)
}

export function showError(
  error: unknown,
  providedOptions?: Omit<Partial<ToastOptions>, 'level'>,
): string {
  const options = {
    level: 'error' as const,
    ...providedOptions,
  }

  // Use processErrorMessage to handle truncation for error toasts
  const processed = processErrorMessage(error as string, {
    maxLength: options.maxLength ?? 100,
    includeStack: true, // Include stack for expandable error toast
  })

  return show(processed.displayMessage, {
    ...options,
    expandableErrorData: {
      isTruncated: processed.isTruncated,
      errorDetails: processed.errorDetails,
    },
  })
}

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
 * @param promise - The promise to monitor.
 * @param messages - Toast messages for loading, success, and error. Success and error can be strings or functions.
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
