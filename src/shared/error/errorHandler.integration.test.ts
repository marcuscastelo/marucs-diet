import { describe, expect, it, vi } from 'vitest'

import {
  BusinessRuleError,
  InvariantError,
  ValidationError,
} from '~/shared/domain/errors'
import {
  classifyAndHandleError,
  handleApplicationError,
  handleDomainError,
  isBusinessRuleDomainError,
  isDomainError,
  isInvariantDomainError,
  isValidationDomainError,
} from '~/shared/error/errorHandler'

// Mock console.error to avoid noise in test output
vi.spyOn(console, 'error').mockImplementation(() => {})

// Create concrete implementations for testing
class TestValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_TEST', context)
  }
}

class TestBusinessRuleError extends BusinessRuleError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BUSINESS_RULE_TEST', context)
  }
}

class TestInvariantError extends InvariantError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'INVARIANT_TEST', context)
  }
}

describe('ErrorHandler DomainError Integration', () => {
  const mockContext = {
    operation: 'testOperation',
    entityType: 'TestEntity',
    module: 'test',
    component: 'testComponent',
  }

  describe('Domain Error Classification', () => {
    it('should correctly identify domain errors', () => {
      const validationError = new TestValidationError('Test validation error')
      const businessError = new TestBusinessRuleError('Test business error')
      const invariantError = new TestInvariantError('Test invariant error')
      const regularError = new Error('Regular error')

      expect(isDomainError(validationError)).toBe(true)
      expect(isDomainError(businessError)).toBe(true)
      expect(isDomainError(invariantError)).toBe(true)
      expect(isDomainError(regularError)).toBe(false)
      expect(isDomainError('string error')).toBe(false)
    })

    it('should correctly identify specific domain error types', () => {
      const validationError = new TestValidationError('Test validation error')
      const businessError = new TestBusinessRuleError('Test business error')
      const invariantError = new TestInvariantError('Test invariant error')

      expect(isValidationDomainError(validationError)).toBe(true)
      expect(isValidationDomainError(businessError)).toBe(false)
      expect(isValidationDomainError(invariantError)).toBe(false)

      expect(isBusinessRuleDomainError(businessError)).toBe(true)
      expect(isBusinessRuleDomainError(validationError)).toBe(false)
      expect(isBusinessRuleDomainError(invariantError)).toBe(false)

      expect(isInvariantDomainError(invariantError)).toBe(true)
      expect(isInvariantDomainError(validationError)).toBe(false)
      expect(isInvariantDomainError(businessError)).toBe(false)
    })
  })

  describe('Domain Error Handling', () => {
    it('should handle validation errors with warning severity', () => {
      const validationError = new TestValidationError('Test validation error', {
        field: 'testField',
      })

      expect(() => {
        handleDomainError(validationError, mockContext)
      }).not.toThrow()

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[WARNING][test][testComponent::testOperation]',
        ),
        validationError,
      )
    })

    it('should handle business rule errors with error severity', () => {
      const businessError = new TestBusinessRuleError(
        'Test business rule error',
      )

      expect(() => {
        handleDomainError(businessError, mockContext)
      }).not.toThrow()

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR][test][testComponent::testOperation]'),
        businessError,
      )
    })

    it('should handle invariant errors with critical severity', () => {
      const invariantError = new TestInvariantError('Test invariant error')

      expect(() => {
        handleDomainError(invariantError, mockContext)
      }).not.toThrow()

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[CRITICAL][test][testComponent::testOperation]',
        ),
        invariantError,
      )
    })

    it('should include domain error code and context in logs', () => {
      const error = new TestValidationError('Test error', {
        customData: 'test',
      })

      handleDomainError(error, mockContext)

      expect(console.error).toHaveBeenCalledWith(
        'Business context:',
        expect.objectContaining({
          errorCode: 'VALIDATION_TEST',
          domainContext: { customData: 'test' },
        }),
      )
    })
  })

  describe('Application Error Integration', () => {
    it('should delegate domain errors to handleDomainError', () => {
      const domainError = new TestValidationError('Test domain error')

      expect(() => {
        handleApplicationError(domainError, mockContext)
      }).not.toThrow()

      // Should be handled as domain error (warning severity for validation)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[WARNING]'),
        domainError,
      )
    })

    it('should handle non-domain errors normally', () => {
      const regularError = new Error('Regular application error')

      expect(() => {
        handleApplicationError(regularError, mockContext)
      }).not.toThrow()

      // Should be handled as regular application error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR][test][testComponent::testOperation]'),
        regularError,
      )
    })
  })

  describe('Automatic Classification', () => {
    it('should automatically route domain errors to handleDomainError', () => {
      const domainError = new TestBusinessRuleError('Test business error')

      expect(() => {
        classifyAndHandleError(domainError, mockContext)
      }).not.toThrow()

      // Should be classified and handled as domain error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        domainError,
      )
    })

    it('should fallback to other handlers for non-domain errors', () => {
      const regularError = new Error('Regular error')

      expect(() => {
        classifyAndHandleError(regularError, mockContext)
      }).not.toThrow()

      // Should fallback to system error handler
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[CRITICAL][test][testComponent::testOperation]',
        ),
        regularError,
      )
    })
  })
})
