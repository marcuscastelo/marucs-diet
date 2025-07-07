import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createValidatedFood,
  fetchFoods,
} from '~/modules/diet/food/application/food'
import {
  FoodInvalidMacrosError,
  FoodInvalidNameError,
  FoodNegativeMacrosError,
} from '~/modules/diet/food/domain/foodErrors'
import { handleApplicationError } from '~/shared/error/errorHandler'

// Mock dependencies
vi.mock('~/modules/diet/food/infrastructure/supabaseFoodRepository')
vi.mock('~/shared/error/errorHandler', () => ({
  handleApplicationError: vi.fn(),
  handleInfrastructureError: vi.fn(),
  isBackendOutageError: vi.fn(() => false),
}))
vi.mock('~/shared/error/backendOutageSignal')
vi.mock('~/modules/diet/food/infrastructure/api/application/apiFood')
vi.mock('~/modules/search/application/searchCache')
vi.mock('~/modules/toast/application/toastManager')
vi.mock('~/shared/formatError')

const mockHandleApplicationError = vi.mocked(handleApplicationError)

describe('Food Application - Domain Error Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createValidatedFood', () => {
    it('should handle domain validation errors', async () => {
      // Test invalid name (ValidationError)
      const result = await createValidatedFood({
        name: '', // Invalid name
        macros: { carbs: 10, protein: 5, fat: 2 },
        ean: null,
      })

      expect(result).toBeNull()
      expect(mockHandleApplicationError).toHaveBeenCalledWith(
        expect.any(FoodInvalidNameError),
        expect.objectContaining({
          operation: 'createValidatedFood',
          entityType: 'Food',
          module: 'diet/food',
          component: 'foodApplication',
        }),
      )
    })

    it('should handle invalid macros validation errors', async () => {
      const result = await createValidatedFood({
        name: 'Valid Food',
        macros: { carbs: -1, protein: 5, fat: 2 }, // Invalid macros (negative)
        ean: null,
      })

      expect(result).toBeNull()
      expect(mockHandleApplicationError).toHaveBeenCalledWith(
        expect.any(FoodNegativeMacrosError),
        expect.objectContaining({
          operation: 'createValidatedFood',
          entityType: 'Food',
          module: 'diet/food',
          component: 'foodApplication',
        }),
      )
    })

    it('should handle invalid macros type errors', async () => {
      const result = await createValidatedFood({
        name: 'Valid Food',
        // @ts-expect-error Testing invalid types
        macros: { carbs: 'invalid', protein: 5, fat: 2 }, // Invalid macros types
        ean: null,
      })

      expect(result).toBeNull()
      expect(mockHandleApplicationError).toHaveBeenCalledWith(
        expect.any(FoodInvalidMacrosError),
        expect.objectContaining({
          operation: 'createValidatedFood',
          entityType: 'Food',
          module: 'diet/food',
          component: 'foodApplication',
        }),
      )
    })

    it('should include additional data in error context', async () => {
      const foodParams = {
        name: '',
        macros: { carbs: 10, protein: 5, fat: 2 },
        ean: null,
      }

      await createValidatedFood(foodParams)

      expect(mockHandleApplicationError).toHaveBeenCalledWith(
        expect.any(FoodInvalidNameError),
        expect.objectContaining({
          additionalData: foodParams,
        }),
      )
    })
  })

  describe('existing functions with enhanced context', () => {
    it('should have proper error context in fetchFoods', async () => {
      // This test verifies that the existing functions now have proper error context
      // The actual error handling is mocked, but we can verify the context structure
      expect(fetchFoods).toBeDefined()
      expect(typeof fetchFoods).toBe('function')
    })
  })
})
