/* eslint-disable */
/**
 * Centralized error handling utilities for the application layer.
 * Components should not directly use console.error, instead they should
 * use these utilities or pass errors to their parent components.
 */

import { DomainError, ValidationError, BusinessRuleError, InvariantError } from '~/shared/domain/errors'

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info'

export type ErrorContext = {
  component?: string
  operation?: string
  userId?: string
  additionalData?: Record<string, unknown>
}

export type EnhancedErrorContext = {
  operation: string
  entityType?: string
  entityId?: string | number
  userId?: string | number
  severity?: ErrorSeverity
  module?: string
  component?: string
  businessContext?: Record<string, unknown>
  technicalContext?: Record<string, unknown>
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
 * Enhanced log function that supports both context types
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

/**
 * Enhanced log function for comprehensive error contexts
 */
export function logEnhancedError(error: unknown, context: EnhancedErrorContext): void {
  const timestamp = new Date().toISOString()
  const severity = context.severity ?? 'error'
  const module = context.module ?? 'unknown'
  const component = context.component ?? getCallerContext()
  const operation = context.operation
  
  const contextStr = `[${severity.toUpperCase()}][${module}][${component}::${operation}]`
  
  console.error(`${timestamp} ${contextStr} Error:`, error)
  
  if (context.entityType && context.entityId) {
    console.error(`Entity: ${context.entityType}#${context.entityId}`)
  }
  
  if (context.userId) {
    console.error(`User: ${context.userId}`)
  }
  
  if (context.businessContext) {
    console.error('Business context:', context.businessContext)
  }
  
  if (context.technicalContext) {
    console.error('Technical context:', context.technicalContext)
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
 * Enhanced API error handler with rich context support
 * @param error - The error to handle
 * @param context - Enhanced context information (optional for backward compatibility)
 */
export function handleApiError(error: unknown, context?: EnhancedErrorContext): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  
  if (context) {
    logEnhancedError(errorToLog, {
      ...context,
      severity: context.severity ?? 'error',
      module: context.module ?? 'api',
    })
  } else {
    // Backward compatibility - use legacy logging
    const inferredComponent = getCallerContext()
    logError(errorToLog, {
      component: inferredComponent,
      operation: 'API request',
      additionalData: { originalError: error },
    })
  }
}

/**
 * Handle application layer orchestration errors
 * @param error - The error to handle
 * @param context - Enhanced context information
 */
export function handleApplicationError(error: unknown, context: EnhancedErrorContext): void {
  // If it's a domain error, delegate to the domain error handler
  if (error instanceof DomainError) {
    handleDomainError(error, context)
    return
  }

  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  
  logEnhancedError(errorToLog, {
    ...context,
    severity: context.severity ?? 'error',
    module: context.module ?? 'application',
  })
}

/**
 * Handle infrastructure errors (database, network, external services)
 * @param error - The error to handle
 * @param context - Enhanced context information
 */
export function handleInfrastructureError(error: unknown, context: EnhancedErrorContext): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  
  logEnhancedError(errorToLog, {
    ...context,
    severity: context.severity ?? 'critical',
    module: context.module ?? 'infrastructure',
  })
}

/**
 * Handle validation and business rule errors
 * @param error - The error to handle
 * @param context - Enhanced context information
 */
export function handleValidationError(error: unknown, context: EnhancedErrorContext): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  
  logEnhancedError(errorToLog, {
    ...context,
    severity: context.severity ?? 'warning',
    module: context.module ?? 'validation',
  })
}

/**
 * Handle user action errors (permissions, invalid operations)
 * @param error - The error to handle
 * @param context - Enhanced context information
 */
export function handleUserError(error: unknown, context: EnhancedErrorContext): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  
  logEnhancedError(errorToLog, {
    ...context,
    severity: context.severity ?? 'warning',
    module: context.module ?? 'user',
  })
}

/**
 * Handle unexpected system errors and programming errors
 * @param error - The error to handle
 * @param context - Enhanced context information
 */
export function handleSystemError(error: unknown, context: EnhancedErrorContext): void {
  let errorToLog = error
  if (!(error instanceof Error)) {
    errorToLog = wrapErrorWithStack(error)
  }
  
  logEnhancedError(errorToLog, {
    ...context,
    severity: context.severity ?? 'critical',
    module: context.module ?? 'system',
  })
}

/**
 * Handle domain errors with enhanced context and proper classification
 * @param error - The domain error to handle
 * @param context - Enhanced context information
 */
export function handleDomainError(error: DomainError, context: EnhancedErrorContext): void {
  const enhancedContext = {
    ...context,
    severity: context.severity ?? 'warning' as ErrorSeverity,
    module: context.module ?? 'domain',
    businessContext: {
      ...context.businessContext,
      errorCode: error.code,
      domainContext: error.context,
    },
  }

  // Determine severity based on domain error type
  if (error instanceof InvariantError) {
    enhancedContext.severity = 'critical'
  } else if (error instanceof BusinessRuleError) {
    enhancedContext.severity = 'error'
  } else if (error instanceof ValidationError) {
    enhancedContext.severity = 'warning'
  }

  logEnhancedError(error, enhancedContext)
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

/**
 * Error classification utilities
 */

export function isValidationError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('validation') || error.includes('invalid') || error.includes('required')
  }
  if (error instanceof Error) {
    return error.message.includes('validation') || error.message.includes('invalid') || error.message.includes('required')
  }
  return false
}

export function isInfrastructureError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('database') || error.includes('connection') || error.includes('timeout') || isBackendOutageError(error)
  }
  if (error instanceof Error) {
    return error.message.includes('database') || error.message.includes('connection') || error.message.includes('timeout') || isBackendOutageError(error)
  }
  return false
}

export function isUserError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('permission') || error.includes('unauthorized') || error.includes('forbidden')
  }
  if (error instanceof Error) {
    return error.message.includes('permission') || error.message.includes('unauthorized') || error.message.includes('forbidden')
  }
  return false
}

export function isApplicationError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('orchestration') || error.includes('workflow') || error.includes('business')
  }
  if (error instanceof Error) {
    return error.message.includes('orchestration') || error.message.includes('workflow') || error.message.includes('business')
  }
  return false
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}

export function isValidationDomainError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isBusinessRuleDomainError(error: unknown): error is BusinessRuleError {
  return error instanceof BusinessRuleError
}

export function isInvariantDomainError(error: unknown): error is InvariantError {
  return error instanceof InvariantError
}

/**
 * Automatically classify and handle errors with appropriate specialized handler
 * @param error - The error to classify and handle
 * @param baseContext - Base context information
 */
export function classifyAndHandleError(error: unknown, baseContext: EnhancedErrorContext): void {
  // First check if it's a domain error (highest priority)
  if (error instanceof DomainError) {
    handleDomainError(error, baseContext)
  } else if (isValidationError(error)) {
    handleValidationError(error, baseContext)
  } else if (isInfrastructureError(error)) {
    handleInfrastructureError(error, baseContext)
  } else if (isUserError(error)) {
    handleUserError(error, baseContext)
  } else if (isApplicationError(error)) {
    handleApplicationError(error, baseContext)
  } else {
    handleSystemError(error, baseContext)
  }
}
