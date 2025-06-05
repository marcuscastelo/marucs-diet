/**
 * Error Examples
 *
 * Sample error scenarios for testing and demonstrating error display in toasts.
 */

import { showErrorToast } from './errorHandler'

/**
 * Generate a short error
 */
export function showShortError(): void {
  showErrorToast(new Error('A simple, short error message'), {
    context: 'user-action',
    errorContext: {
      component: 'ErrorExamples',
      operation: 'showShortError',
    },
  })
}

/**
 * Generate a medium error with some stack trace
 */
export function showMediumError(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const obj = {} as any
    // This will cause a TypeError
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    obj.nonExistentMethod()
  } catch (error) {
    showErrorToast(error, {
      context: 'user-action',
      errorContext: {
        component: 'ErrorExamples',
        operation: 'showMediumError',
        additionalData: { attempted: 'method call on undefined' },
      },
    })
  }
}

/**
 * Generate a long error message that will be truncated
 */
export function showLongError(): void {
  const longMessage = `This is a very long error message that will demonstrate 
  the truncation capability of our toast system. It contains multiple sentences
  and will definitely exceed the maximum length allowed for display in a toast.
  When this happens, the message will be truncated and an option to view the
  complete details will be provided to the user. This helps keep the UI clean
  while still allowing users to access the full error information if they need it.
  The error details modal will display this entire message along with any stack
  trace or context information that may be available.`

  showErrorToast(new Error(longMessage), {
    context: 'user-action',
    errorContext: {
      component: 'ErrorExamples',
      operation: 'showLongError',
      additionalData: { wordCount: longMessage.split(' ').length },
    },
  })
}

/**
 * Generate an error with nested causes
 */
export function showNestedError(): void {
  try {
    try {
      // Generate a nested error
      throw new Error('Database connection failed')
    } catch (dbError) {
      throw new Error('Failed to fetch user data', { cause: dbError })
    }
  } catch (error) {
    showErrorToast(error, {
      context: 'user-action',
      errorContext: {
        component: 'ErrorExamples',
        operation: 'showNestedError',
      },
    })
  }
}

/**
 * Generate a validation error
 */
export function showValidationError(): void {
  const validationErrors = {
    name: 'Name is required',
    email: 'Email format is invalid',
    password: 'Password must be at least 8 characters',
  }

  showErrorToast(new Error('Form validation failed'), {
    context: 'user-action',
    errorContext: {
      component: 'ErrorExamples',
      operation: 'showValidationError',
      additionalData: { validationErrors },
    },
  })
}

/**
 * Show a background operation error
 */
export function showBackgroundError(): void {
  showErrorToast(new Error('Failed to sync data in background'), {
    context: 'background',
    errorContext: {
      component: 'ErrorExamples',
      operation: 'backgroundSync',
      additionalData: { lastSync: new Date().toISOString() },
    },
  })
}
