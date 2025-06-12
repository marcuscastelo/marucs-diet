/**
 * Centralized error handling utilities for the application layer.
 * Components should not directly use console.error, instead they should
 * use these utilities or pass errors to their parent components.
 */

export type ErrorContext = {
  component?: string
  operation?: string
  userId?: string
  additionalData?: Record<string, unknown>
}

/**
 * Log an error with context information
 */
export function logError(error: unknown, context?: ErrorContext): void {
  const timestamp = new Date().toISOString()
  const componentStr =
    typeof context?.component === 'string' && context.component.trim() !== ''
      ? context.component
      : 'Unknown'
  const operationStr =
    typeof context?.operation === 'string' && context.operation.trim() !== ''
      ? `::${context.operation}`
      : ''
  const contextStr = `[${componentStr}${operationStr}]`

  console.error(`${timestamp} ${contextStr} Error:`, error)

  if (context?.additionalData !== undefined) {
    console.error('Additional context:', context.additionalData)
  }

  // In the future, this could send errors to a monitoring service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Helper to wrap a non-Error object in an Error and attach the original error as a symbol property.
 */
const ORIGINAL_ERROR_SYMBOL = Symbol('originalError')
export function wrapErrorWithStack(error: unknown): Error {
  let message = 'Unknown error'
  if (typeof error === 'object' && error !== null) {
    // If error has a message and other properties, serialize all
    const keys = Object.keys(error)
    if (
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    ) {
      if (keys.length > 1) {
        message = `${(error as { message: string }).message}: ${JSON.stringify(
          error,
        )}`
      } else {
        message = (error as { message: string }).message
      }
    } else {
      // No .message, serialize everything
      message = JSON.stringify(error)
    }
  }
  const wrapped: Error = new Error(message)
  // Attach the original error as a symbol property for traceability
  Object.defineProperty(wrapped, ORIGINAL_ERROR_SYMBOL, {
    value: error,
    enumerable: false,
    configurable: true,
    writable: true,
  })
  return wrapped
}

/**
 * Handle errors related to API operations
 */
export function handleApiError(error: unknown, context?: ErrorContext): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  logError(errorToLog, {
    ...context,
    operation: `${context?.operation ?? 'API'} request`,
    additionalData: {
      ...(context?.additionalData ?? {}),
      originalError: error,
    },
  })
}

/**
 * Handle errors related to clipboard operations
 */
export function handleClipboardError(
  error: unknown,
  context?: ErrorContext,
): void {
  logError(error, { ...context, operation: 'Clipboard operation' })
}

/**
 * Handle errors related to scanner/hardware operations
 */
export function handleScannerError(
  error: unknown,
  context?: ErrorContext,
): void {
  logError(error, { ...context, operation: 'Scanner operation' })
}

/**
 * Handle validation/business logic errors
 */
export function handleValidationError(
  error: unknown,
  context?: ErrorContext,
): void {
  logError(error, { ...context, operation: 'Validation' })
}
