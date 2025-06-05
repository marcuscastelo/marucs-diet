/**
 * Smart Toast Promise
 *
 * An intelligent replacement for the legacy toastPromise utility.
 * Integrates with the new toast queue system and provides context-aware behavior.
 */

import { ToastContext, ToastOptions } from './toastConfig'
import { showPromise } from './toastManager'

/**
 * Options for smart toast promise operations
 */
export type SmartToastPromiseOptions<T> = {
  /** Context of the operation (determines toast behavior) */
  context?: ToastContext
  /** Loading message */
  loading?: string
  /** Success message or function to generate message from result */
  success?: string | ((data: T) => string)
  /** Error message or function to generate message from error */
  error?: string | ((error: unknown) => string)
  /** Additional toast options */
  options?: Partial<ToastOptions>
}

/**
 * Smart toast promise wrapper with context-aware behavior
 *
 * This is the replacement for the legacy toastPromise function.
 * It provides intelligent toast management based on operation context.
 *
 * @param promise - The promise to wrap
 * @param toastOptions - Configuration for toast behavior
 * @returns The original promise result
 *
 * @example
 * ```typescript
 * // User-initiated action (shows all toasts)
 * const result = await smartToastPromise(
 *   saveUserProfile(data),
 *   {
 *     context: 'user-action',
 *     loading: 'Saving profile...',
 *     success: 'Profile saved successfully!',
 *     error: 'Failed to save profile'
 *   }
 * )
 *
 * // Background operation (only shows errors)
 * const data = await smartToastPromise(
 *   fetchBackgroundData(),
 *   {
 *     context: 'background',
 *     loading: 'Syncing data...',
 *     success: 'Data synced'
 *   }
 * )
 * ```
 */
export async function smartToastPromise<T>(
  promise: Promise<T>,
  toastOptions: SmartToastPromiseOptions<T> = {},
): Promise<T> {
  const {
    context = 'user-action',
    loading,
    success,
    error,
    options = {},
  } = toastOptions

  return showPromise(
    promise,
    {
      loading,
      success,
      error,
    },
    context,
    options,
  )
}

/**
 * Execute a promise in detached mode without waiting for completion
 *
 * This function detaches from the promise chain, making it ideal for
 * bootstrap operations, realtime callbacks, and other fire-and-forget
 * scenarios where you don't need to await the result.
 *
 * Note: "Detached" refers to promise chain detachment, not toast context.
 * You can still use any toast context ('user-action', 'background', 'system').
 *
 * @param promise - The promise to execute in detached mode
 * @param toastOptions - Configuration for toast behavior
 *
 * @example
 * ```typescript
 * // Bootstrap operation - detached execution
 * function bootstrap() {
 *   smartToastPromiseDetached(fetchAllUserData(), {
 *     context: 'background',
 *     loading: 'Loading user data...',
 *     error: 'Failed to load user data'
 *   })
 * }
 *
 * // Realtime callback - fire and forget
 * onRealtimeUpdate(() => {
 *   smartToastPromiseDetached(refreshCache(), {
 *     context: 'system',
 *     error: 'Failed to refresh cache'
 *   })
 * })
 * ```
 */
export function smartToastPromiseDetached<T>(
  promise: Promise<T>,
  toastOptions: SmartToastPromiseOptions<T> = {},
): void {
  smartToastPromise(promise, toastOptions).catch(() => {
    // Errors are already handled by smartToastPromise internally
    // This catch prevents unhandled promise rejection warnings
  })
}

/**
 * Convenience function for user-action toasts
 * Always shows loading, success, and error toasts
 */
export function userActionToast<T>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
): Promise<T> {
  return smartToastPromise(promise, {
    context: 'user-action',
    ...messages,
    options,
  })
}

/**
 * Convenience function for background operation toasts
 * Only shows error toasts by default
 */
export function backgroundToast<T>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
): Promise<T> {
  return smartToastPromise(promise, {
    context: 'background',
    ...messages,
    options,
  })
}

/**
 * Convenience function for system operation toasts
 * Shows minimal toasts, focuses on errors
 */
export function systemToast<T>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: unknown) => string)
  },
  options?: Partial<ToastOptions>,
): Promise<T> {
  return smartToastPromise(promise, {
    context: 'system',
    ...messages,
    options,
  })
}

// Export the main function as default for easier migration
export default smartToastPromise
