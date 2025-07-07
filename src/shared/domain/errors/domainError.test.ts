import { describe, expect, it } from 'vitest'

import {
  BusinessRuleError,
  DomainError,
  ValidationError,
} from '~/shared/domain/errors'

describe('DomainError', () => {
  class TestDomainError extends DomainError {
    constructor(
      message: string,
      code: string,
      context?: Record<string, unknown>,
    ) {
      super(message, code, context)
    }
  }

  it('should create domain error with correct properties', () => {
    const error = new TestDomainError('Test message', 'TEST_CODE', {
      key: 'value',
    })

    expect(error.message).toBe('Test message')
    expect(error.code).toBe('TEST_CODE')
    expect(error.context).toEqual({ key: 'value' })
    expect(error.name).toBe('TestDomainError')
    expect(error instanceof Error).toBe(true)
    expect(error instanceof DomainError).toBe(true)
  })

  it('should create domain error without context', () => {
    const error = new TestDomainError('Test message', 'TEST_CODE')

    expect(error.message).toBe('Test message')
    expect(error.code).toBe('TEST_CODE')
    expect(error.context).toBeUndefined()
  })

  it('should have proper stack trace', () => {
    const error = new TestDomainError('Test message', 'TEST_CODE')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('TestDomainError')
  })
})

describe('ValidationError', () => {
  class TestValidationError extends ValidationError {
    constructor(
      message: string,
      code: string,
      context?: Record<string, unknown>,
    ) {
      super(message, code, context)
    }
  }

  it('should inherit from DomainError', () => {
    const error = new TestValidationError('Test validation', 'TEST_VALIDATION')

    expect(error instanceof DomainError).toBe(true)
    expect(error instanceof ValidationError).toBe(true)
  })
})

describe('BusinessRuleError', () => {
  class TestBusinessRuleError extends BusinessRuleError {
    constructor(
      message: string,
      code: string,
      context?: Record<string, unknown>,
    ) {
      super(message, code, context)
    }
  }

  it('should inherit from DomainError', () => {
    const error = new TestBusinessRuleError(
      'Test business rule',
      'TEST_BUSINESS_RULE',
    )

    expect(error instanceof DomainError).toBe(true)
    expect(error instanceof BusinessRuleError).toBe(true)
  })
})
