import { describe, expect, it } from 'vitest'

import {
  FoodDuplicateEanError,
  FoodInvalidEanError,
  FoodInvalidMacrosError,
  FoodInvalidNameError,
  FoodNegativeMacrosError,
  FoodPromotionError,
} from '~/modules/diet/food/domain/foodErrors'
import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

describe('Food Domain Errors', () => {
  describe('FoodInvalidNameError', () => {
    it('should be a ValidationError', () => {
      const error = new FoodInvalidNameError('')
      expect(error instanceof ValidationError).toBe(true)
    })

    it('should have correct message and code', () => {
      const error = new FoodInvalidNameError('invalid')
      expect(error.code).toBe('FOOD_INVALID_NAME')
      expect(error.message).toContain('invalid')
    })
  })

  describe('FoodInvalidMacrosError', () => {
    it('should be a ValidationError', () => {
      const error = new FoodInvalidMacrosError({})
      expect(error instanceof ValidationError).toBe(true)
    })

    it('should have correct code', () => {
      const error = new FoodInvalidMacrosError({})
      expect(error.code).toBe('FOOD_INVALID_MACROS')
    })
  })

  describe('FoodInvalidEanError', () => {
    it('should be a ValidationError', () => {
      const error = new FoodInvalidEanError('invalid-ean')
      expect(error instanceof ValidationError).toBe(true)
    })

    it('should have correct code', () => {
      const error = new FoodInvalidEanError('invalid-ean')
      expect(error.code).toBe('FOOD_INVALID_EAN')
    })
  })

  describe('FoodNegativeMacrosError', () => {
    it('should be a BusinessRuleError', () => {
      const error = new FoodNegativeMacrosError({ carbs: -1 })
      expect(error instanceof BusinessRuleError).toBe(true)
    })

    it('should have correct code', () => {
      const error = new FoodNegativeMacrosError({ carbs: -1 })
      expect(error.code).toBe('FOOD_NEGATIVE_MACROS')
    })
  })

  describe('FoodDuplicateEanError', () => {
    it('should be a BusinessRuleError', () => {
      const error = new FoodDuplicateEanError('123456789')
      expect(error instanceof BusinessRuleError).toBe(true)
    })

    it('should have correct code', () => {
      const error = new FoodDuplicateEanError('123456789')
      expect(error.code).toBe('FOOD_DUPLICATE_EAN')
    })
  })

  describe('FoodPromotionError', () => {
    it('should be a BusinessRuleError', () => {
      const error = new FoodPromotionError({}, 'missing id')
      expect(error instanceof BusinessRuleError).toBe(true)
    })

    it('should have correct code', () => {
      const error = new FoodPromotionError({}, 'missing id')
      expect(error.code).toBe('FOOD_PROMOTION_ERROR')
    })
  })
})
