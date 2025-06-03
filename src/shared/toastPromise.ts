import toast from 'solid-toast'
import { handleApiError } from './error/errorHandler'

export type ToastPromiseOptions<T> = {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: unknown) => string)
}

/**
 * Wraps a promise with toast notifications for loading, success, and error states
 * with support for custom error message handling
 */
export async function toastPromise<T>(
  promise: Promise<T>,
  options: ToastPromiseOptions<T>,
): Promise<T> {
  const toastId = toast.loading(options.loading)

  try {
    const result = await promise

    const successMessage =
      typeof options.success === 'function'
        ? options.success(result)
        : options.success

    toast.success(successMessage, { id: toastId })
    return result
  } catch (error) {
    const errorMessage =
      typeof options.error === 'function' ? options.error(error) : options.error

    handleApiError(error, {
      component: 'ToastPromise',
      operation: 'toastPromise',
      additionalData: {
        options,
        errorMessage,
      },
    })

    toast.error(errorMessage, { id: toastId })
    throw error
  }
}
