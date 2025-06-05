/**
 * Legacy Toast Promise (DEPRECATED)
 *
 * @deprecated This file is deprecated. Use smartToastPromise from ~/shared/toast instead.
 * This wrapper is provided for backward compatibility only.
 */

import { smartToastPromise } from './toast/smartToastPromise'

export type ToastPromiseOptions<T> = {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: unknown) => string)
}

/**
 * @deprecated Use smartToastPromise from ~/shared/toast instead
 */
export async function toastPromise<T>(
  promise: Promise<T>,
  options: ToastPromiseOptions<T>,
): Promise<T> {
  console.warn(
    'toastPromise is deprecated. Use smartToastPromise from ~/shared/toast instead.',
  )

  return smartToastPromise(promise, {
    context: 'user-action', // Default to user-action for legacy compatibility
    loading: options.loading,
    success: options.success,
    error: options.error,
  })
}
