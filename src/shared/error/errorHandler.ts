/* eslint-disable */
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

export function getCallerFile(): string | undefined {
  const originalPrepareStackTrace = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = (_, stack) => stack
    const err = new Error()

    const stack = err.stack as unknown as NodeJS.CallSite[]

    // stack[0] = getCallerFile
    // stack[1] = quem chamou getCallerFile
    // stack[2] = o arquivo chamador da função que chamou getCallerFile
    const caller = stack[2]
    return caller?.getFileName?.() ?? undefined
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }
}

function getCallerContext(): string {
  const file = getCallerFile()
  if (file === undefined || file === '') return 'unknown'
  return file.replace(/.*\/src\//, '').replace(/\.[jt]sx?$/, '')
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
}

const ORIGINAL_ERROR_SYMBOL = Symbol('originalError')
export function wrapErrorWithStack(error: unknown): Error {
  let message = 'Unknown error'
  if (typeof error === 'object' && error !== null) {
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
      message = JSON.stringify(error)
    }
  }
  const wrapped: Error = new Error(message)
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
 * Now infers context/module automatically; manual context is ignored.
 */
export function handleApiError(error: unknown): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  const inferredComponent = getCallerContext()
  logError(errorToLog, {
    component: inferredComponent,
    operation: 'API request',
    additionalData: { originalError: error },
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

/**
 * Detects if an error is a backend outage/network error (e.g., fetch failed, CORS, DNS, etc).
 * @param error - The error to check
 * @returns True if the error is a backend outage/network error
 */
export function isBackendOutageError(error: unknown): boolean {
  if (typeof error === 'string') {
    return (
      error.includes('Failed to fetch') ||
      error.includes('NetworkError') ||
      error.includes('CORS') ||
      error.includes('net::ERR') ||
      error.includes('Network request failed')
    )
  }
  if (typeof error === 'object' && error !== null) {
    const msg =
      typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : ''
    const details =
      typeof (error as { details?: unknown }).details === 'string'
        ? (error as { details: string }).details
        : ''
    return (
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      msg.includes('CORS') ||
      msg.includes('net::ERR') ||
      msg.includes('Network request failed') ||
      details.includes('Failed to fetch') ||
      details.includes('NetworkError') ||
      details.includes('CORS') ||
      details.includes('net::ERR') ||
      details.includes('Network request failed')
    )
  }
  return false
}
