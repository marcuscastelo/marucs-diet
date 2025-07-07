/**
 * Base class for all domain errors.
 * Domain errors represent business rule violations and invariant failures.
 * They should be lightweight and focused on domain concepts.
 */
export abstract class DomainError extends Error {
  /**
   * A machine-readable error code for programmatic handling
   */
  public readonly code: string

  /**
   * Additional context data for the error
   */
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.context = context

    // Ensure proper stack trace (V8 engines)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Error for validation rule violations (schema validation, format validation, etc.)
 */
export abstract class ValidationError extends DomainError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context)
  }
}

/**
 * Error for business rule violations (domain logic constraints)
 */
export abstract class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context)
  }
}

/**
 * Error for invariant violations (consistency constraints)
 */
export abstract class InvariantError extends DomainError {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context)
  }
}
