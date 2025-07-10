/**
 * Centralized error handling utilities for the application layer.
 * Components should not directly use console.error, instead they should
 * use these utilities or pass errors to their parent components.
 */

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
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
export function logEnhancedError(
  error: unknown,
  context: EnhancedErrorContext,
): void {
  const timestamp = new Date().toISOString()
  const severity = context.severity ?? 'error'
  const module = context.module ?? 'unknown'
  const component = context.component ?? getCallerContext()
  const operation = context.operation

  const contextStr = `[${severity.toUpperCase()}][${module}][${component}::${operation}]`

  console.error(`${timestamp} ${contextStr} Error:`, error)

  if (context.entityType !== undefined && context.entityId !== undefined) {
    console.error(`Entity: ${context.entityType}#${context.entityId}`)
  }

  if (context.userId !== undefined) {
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
    if ('message' in error && typeof error.message === 'string') {
      if (keys.length > 1) {
        message = `${error.message}: ${JSON.stringify(error)}`
      } else {
        message = error.message
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
 * Detects if an error is a backend outage/network error (e.g., fetch failed, CORS, DNS, etc).
 * @param error - The error to check
 * @returns True if the error is a backend outage/network error
 */
/**
 * Creates a contextual error handler for any module and entity type.
 * Automatically infers execution context to reduce boilerplate across the entire codebase.
 *
 * This factory function should be used in ALL modules and layers to replace direct calls
 * to handleInfrastructureError, handleApplicationError, handleValidationError, etc.
 *
 * @param module - The architectural layer: 'application' | 'infrastructure' | 'validation' | 'user' | 'system' | 'domain'
 * @param entityType - The business entity being operated on (e.g., 'Food', 'Recipe', 'DayDiet', 'User')
 *
 * @example
 * ```typescript
 * // === APPLICATION LAYER EXAMPLES ===
 *
 * // Day Diet Application
 * const dayDietErrorHandler = createErrorHandler('application', 'DayDiet')
 * dayDietErrorHandler.error(error, { operation: 'fetchAllUserDayDiets' })
 *
 * // Food Application
 * const foodErrorHandler = createErrorHandler('application', 'Food')
 * foodErrorHandler.apiError(error, { operation: 'searchFood' })
 *
 * // Recipe Application
 * const recipeErrorHandler = createErrorHandler('application', 'Recipe')
 * recipeErrorHandler.error(error, { operation: 'createRecipe', entityId: recipeId })
 *
 * // === INFRASTRUCTURE LAYER EXAMPLES ===
 *
 * // Food Infrastructure (Supabase)
 * const foodInfraErrorHandler = createErrorHandler('infrastructure', 'Food')
 * foodInfraErrorHandler.error(error, { operation: 'insertFood' })
 *
 * // Recipe Infrastructure (Supabase)
 * const recipeInfraErrorHandler = createErrorHandler('infrastructure', 'Recipe')
 * recipeInfraErrorHandler.error(error, { operation: 'updateRecipe', entityId: recipeId })
 *
 * // Day Diet Infrastructure (Supabase)
 * const dayDietInfraErrorHandler = createErrorHandler('infrastructure', 'DayDiet')
 * dayDietInfraErrorHandler.error(error, { operation: 'fetchDayDiet', entityId: dayId })
 *
 * // === VALIDATION LAYER EXAMPLES ===
 *
 * // User Validation
 * const userValidationErrorHandler = createErrorHandler('validation', 'User')
 * userValidationErrorHandler.validationError(error, { operation: 'validateUserData' })
 *
 * // Recipe Validation
 * const recipeValidationErrorHandler = createErrorHandler('validation', 'Recipe')
 * recipeValidationErrorHandler.validationError(error, { operation: 'validateRecipeSchema' })
 *
 * // === DOMAIN LAYER EXAMPLES ===
 *
 * // Item Group Domain Logic
 * const itemGroupDomainErrorHandler = createErrorHandler('domain', 'ItemGroup')
 * itemGroupDomainErrorHandler.error(error, { operation: 'validateGroupHierarchy' })
 *
 * // === SYSTEM LAYER EXAMPLES ===
 *
 * // Weight System Operations
 * const weightSystemErrorHandler = createErrorHandler('system', 'Weight')
 * weightSystemErrorHandler.criticalError(error, { operation: 'systemSync' })
 *
 * // Search System Operations
 * const searchSystemErrorHandler = createErrorHandler('system', 'Search')
 * searchSystemErrorHandler.error(error, { operation: 'cacheInvalidation' })
 *
 * // === MIGRATION GUIDE ===
 *
 * // Replace these old patterns:
 * handleInfrastructureError(error, { operation: 'insertFood', entityType: 'Food', module: 'infrastructure', component: 'supabaseFoodRepository' })
 * handleApplicationError(error, { operation: 'searchFood', entityType: 'Food', module: 'application', component: 'food' })
 * handleValidationError(error, { operation: 'validateUserData', entityType: 'User', module: 'validation', component: 'userValidation' })
 * handleUserError(error, { operation: 'userAction', entityType: 'User', module: 'user', component: 'userApplication' })
 * handleSystemError(error, { operation: 'systemSync', entityType: 'Weight', module: 'system', component: 'weightSystem' })
 *
 * // With this new pattern:
 * const errorHandler = createErrorHandler('infrastructure', 'Food')
 * errorHandler.error(error, { operation: 'insertFood' })
 *
 * const errorHandler = createErrorHandler('application', 'Food')
 * errorHandler.error(error, { operation: 'searchFood' })
 *
 * const errorHandler = createErrorHandler('validation', 'User')
 * errorHandler.validationError(error, { operation: 'validateUserData' })
 *
 * const errorHandler = createErrorHandler('user', 'User')
 * errorHandler.error(error, { operation: 'userAction' })
 *
 * const errorHandler = createErrorHandler('system', 'Weight')
 * errorHandler.criticalError(error, { operation: 'systemSync' })
 * ```
 */
export function createErrorHandler<
  TModule extends
    | 'application'
    | 'infrastructure'
    | 'validation'
    | 'user'
    | 'system'
    | 'domain',
>(module: TModule, entityType: string) {
  return {
    /**
     * Handle errors with automatic context inference.
     */
    error: (error: unknown, context?: Partial<EnhancedErrorContext>): void => {
      const inferredComponent = getCallerContext()
      const enhancedContext: EnhancedErrorContext = {
        module,
        entityType,
        component: inferredComponent,
        operation: context?.operation ?? 'unknown',
        severity: context?.severity ?? 'error',
        ...context,
      }

      let errorToLog = error
      if (!(error instanceof Error)) {
        errorToLog = wrapErrorWithStack(error)
      }

      logEnhancedError(errorToLog, enhancedContext)
    },

    /**
     * Handle API-specific errors with automatic context inference.
     */
    apiError: (
      error: unknown,
      context?: Partial<EnhancedErrorContext>,
    ): void => {
      const inferredComponent = getCallerContext()
      const enhancedContext: EnhancedErrorContext = {
        module,
        entityType,
        component: inferredComponent,
        operation: context?.operation ?? 'API request',
        severity: context?.severity ?? 'error',
        ...context,
      }

      let errorToLog = error
      if (!(error instanceof Error)) {
        errorToLog = wrapErrorWithStack(error)
      }

      logEnhancedError(errorToLog, enhancedContext)
    },

    /**
     * Handle validation errors with automatic context inference.
     */
    validationError: (
      error: unknown,
      context?: Partial<EnhancedErrorContext>,
    ): void => {
      const inferredComponent = getCallerContext()
      const enhancedContext: EnhancedErrorContext = {
        module,
        entityType,
        component: inferredComponent,
        operation: context?.operation ?? 'validation',
        severity: context?.severity ?? 'warning',
        ...context,
      }

      let errorToLog = error
      if (!(error instanceof Error)) {
        errorToLog = wrapErrorWithStack(error)
      }

      logEnhancedError(errorToLog, enhancedContext)
    },

    /**
     * Handle critical system errors with automatic context inference.
     */
    criticalError: (
      error: unknown,
      context?: Partial<EnhancedErrorContext>,
    ): void => {
      const inferredComponent = getCallerContext()
      const enhancedContext: EnhancedErrorContext = {
        module,
        entityType,
        component: inferredComponent,
        operation: context?.operation ?? 'system operation',
        severity: 'critical',
        ...context,
      }

      let errorToLog = error
      if (!(error instanceof Error)) {
        errorToLog = wrapErrorWithStack(error)
      }

      logEnhancedError(errorToLog, enhancedContext)
    },
  }
}

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
      'message' in error && typeof error.message === 'string'
        ? error.message
        : ''
    const details =
      'details' in error && typeof error.details === 'string'
        ? error.details
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
