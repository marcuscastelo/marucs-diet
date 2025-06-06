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
 * Handle errors related to API operations
 */
export function handleApiError(error: unknown, context?: ErrorContext): void {
  logError(error, {
    ...context,
    operation: `${context?.operation ?? 'API'} request`,
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
