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
  TOAST_DURATION_INFINITY,
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
function createAndEnqueueToast(message: string, options: ToastOptions): string {
  console.debug('[ToastManager] createAndEnqueueToast called:', {
    message,
    options,
  })

  const toastItem = createToastItem(message, options)
  console.debug('[ToastManager] toastItem created:', toastItem)

  const toastId = enqueue(toastItem)
  console.debug('[ToastManager] toast enqueued with ID:', toastId)

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
  console.debug('[ToastManager] shouldSkipBackgroundToast called:', options)

  const opts = {
    ...DEFAULT_TOAST_OPTIONS[options.context ?? 'user-action'],
    ...options,
  }

  const ctx = opts.context
  const level = opts.level

  const shouldSkip =
    ctx === 'background' &&
    (level === 'success' || level === 'info') &&
    opts.showSuccess !== true

  console.debug('[ToastManager] shouldSkipBackgroundToast result:', shouldSkip)
  return shouldSkip
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
  options: Partial<ToastOptions> & Pick<ToastOptions, 'context'>,
): void {
  console.debug('[ToastManager] filterBackgroundPromiseMessages called:', {
    messages,
    options,
  })

  // const optsInfo = {
  //   ...DEFAULT_TOAST_OPTIONS[context],
  //   ...options,
  //   context,
  //   level: 'info' as ToastLevel,
  // }
  // const optsSuccess = {
  //   ...DEFAULT_TOAST_OPTIONS[context],
  //   ...options,
  //   context,
  //   level: 'success' as ToastLevel,
  // }

  // const originalMessages = { ...messages }

  // if (shouldSkipBackgroundToast(optsInfo)) {
  //   messages.loading = undefined
  //   console.debug(
  //     '[ToastManager] loading message filtered out for background context',
  //   )
  // }
  // if (shouldSkipBackgroundToast(optsSuccess)) {
  //   messages.success = undefined
  //   console.debug(
  //     '[ToastManager] success message filtered out for background context',
  //   )
  // }

  // console.debug('[ToastManager] filterBackgroundPromiseMessages result:', {
  //   originalMessages,
  //   filteredMessages: messages,
  // })
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

function show(
  message: string,
  providedOptions: Partial<ToastOptions> & Pick<ToastOptions, 'context'>,
): string {
  const defaultOptions = DEFAULT_TOAST_OPTIONS[providedOptions.context]
  const options: ToastOptions = {
    ...defaultOptions,
    ...providedOptions,
  }

  console.debug('[ToastManager] show called:', {
    message,
    options: providedOptions,
  })

  if (shouldSkipBackgroundToast(options)) {
    console.debug('[ToastManager] Skipping background toast:', message)
    return ''
  }

  console.debug('[ToastManager] Proceeding to create and enqueue toast')
  return createAndEnqueueToast(message, options)
}

export function showError(
  error: unknown,
  providedOptions: Omit<Partial<ToastOptions>, 'level'> &
    Pick<ToastOptions, 'context'>,
): string {
  const options: Partial<ToastOptions> & Pick<ToastOptions, 'context'> = {
    ...providedOptions,
    level: 'error',
  }

  console.debug('[ToastManager] showError called:', {
    error,
    options,
  })

  // Use processErrorMessage to handle truncation for error toasts
  const processed = processErrorMessage(error as string, {
    maxLength: options.maxLength ?? 100,
    includeStack: true, // Include stack for expandable error toast
  })
  console.debug('[ToastManager] showError processed message:', processed)

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
  providedOptions: Omit<Partial<ToastOptions>, 'level'> &
    Pick<ToastOptions, 'context'>,
): string {
  const options: Partial<ToastOptions> & Pick<ToastOptions, 'context'> = {
    ...providedOptions,
    level: 'success',
  }

  console.debug('[ToastManager] showSuccess called:', {
    message,
    options,
  })

  return show(message, options)
}

export function showLoading(
  message: string,
  providedOptions: Omit<Partial<ToastOptions>, 'level'> &
    Pick<ToastOptions, 'context'>,
): string {
  const options: Partial<ToastOptions> & Pick<ToastOptions, 'context'> = {
    ...providedOptions,
    level: 'info', // Loading is typically an info level toast
    duration: TOAST_DURATION_INFINITY, // Infinite duration for loading
  }

  console.debug('[ToastManager] showLoading called:', {
    message,
    options,
  })
  return show(message, options)
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
  options: Partial<ToastOptions> & Pick<ToastOptions, 'context'>,
): Promise<T> {
  console.debug('[ToastManager] showPromise called:', {
    promise,
    messages,
    options,
  })

  filterBackgroundPromiseMessages(messages, options)
  console.debug('[ToastManager] showPromise after filtering messages:', {
    messages,
  })

  // Show loading toast if enabled and store its ID for precise removal
  let loadingToastId: string | null = null
  if (isNonEmptyString(messages.loading)) {
    console.debug('[ToastManager] showPromise showing loading toast:', {
      loadingMessage: messages.loading,
    })
    loadingToastId = showLoading(messages.loading, options)
    console.debug(
      '[ToastManager] showPromise loading toast ID:',
      loadingToastId,
    )
  } else {
    console.debug('[ToastManager] showPromise no loading toast to show')
  }

  // Use our custom promise handling instead of solid-toast
  return promise
    .then((data) => {
      console.debug(
        '[ToastManager] showPromise promise resolved with data:',
        data,
      )
      // Show success toast if enabled
      const successMsg = resolveValueOrFunction(messages.success, data)
      console.debug('[ToastManager] showPromise resolved success message:', {
        successMsg,
      })
      if (isNonEmptyString(successMsg)) {
        console.debug('[ToastManager] showPromise showing success toast')
        showSuccess(successMsg, options)
      } else {
        console.debug('[ToastManager] showPromise no success toast to show')
      }
      return data
    })
    .catch((err: unknown) => {
      console.debug(
        '[ToastManager] showPromise promise rejected with error:',
        err,
      )
      // Show error toast
      const errorMsg = resolveValueOrFunction(messages.error, err)
      console.debug('[ToastManager] showPromise resolved error message:', {
        errorMsg,
      })
      if (isNonEmptyString(errorMsg)) {
        console.debug('[ToastManager] showPromise showing error toast')
        showError(err, options)
      } else {
        console.debug('[ToastManager] showPromise no error toast to show')
      }
      throw err
    })
    .finally(() => {
      console.debug(
        '[ToastManager] showPromise finally block, removing loading toast:',
        {
          loadingToastId,
        },
      )
      // Remove the specific loading toast if it exists
      if (typeof loadingToastId === 'string' && loadingToastId.length > 0) {
        console.debug('[ToastManager] showPromise dequeuing loading toast')
        dequeueById(loadingToastId)
      } else {
        console.debug('[ToastManager] showPromise no loading toast to remove')
      }
    })
}
