import { describe, expect, it } from 'vitest'

import {
  createRecentFoodInput,
  type RecentFoodCreationParams,
  type RecentFoodInput,
  type RecentFoodRecord,
  type RecentFoodRepository,
  type RecentFoodType,
} from '~/modules/recent-food/domain/recentFood'

describe('Recent Food Domain', () => {
  describe('RecentFoodType', () => {
    it('should support food and recipe types', () => {
      const foodType: RecentFoodType = 'food'
      const recipeType: RecentFoodType = 'recipe'

      expect(foodType).toBe('food')
      expect(recipeType).toBe('recipe')
    })
  })

  describe('RecentFoodRecord', () => {
    it('should define the structure of a recent food record', () => {
      const recentFood: RecentFoodRecord = {
        id: 1,
        user_id: 42,
        type: 'food',
        reference_id: 123,
        last_used: new Date('2023-01-01'),
        times_used: 5,
      }

      expect(recentFood.id).toBe(1)
      expect(recentFood.user_id).toBe(42)
      expect(recentFood.type).toBe('food')
      expect(recentFood.reference_id).toBe(123)
      expect(recentFood.last_used).toBeInstanceOf(Date)
      expect(recentFood.times_used).toBe(5)
    })

    it('should support both food and recipe types', () => {
      const foodRecord: RecentFoodRecord = {
        id: 1,
        user_id: 42,
        type: 'food',
        reference_id: 123,
        last_used: new Date(),
        times_used: 1,
      }

      const recipeRecord: RecentFoodRecord = {
        id: 2,
        user_id: 42,
        type: 'recipe',
        reference_id: 456,
        last_used: new Date(),
        times_used: 3,
      }

      expect(foodRecord.type).toBe('food')
      expect(recipeRecord.type).toBe('recipe')
    })
  })

  describe('RecentFoodInput', () => {
    it('should define the structure for creating recent foods', () => {
      const input: RecentFoodInput = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
        last_used: new Date('2023-01-01'),
        times_used: 1,
      }

      expect(input.user_id).toBe(42)
      expect(input.type).toBe('food')
      expect(input.reference_id).toBe(123)
      expect(input.last_used).toBeInstanceOf(Date)
      expect(input.times_used).toBe(1)
    })

    it('should allow optional fields', () => {
      const minimalInput: RecentFoodInput = {
        user_id: 42,
        type: 'recipe',
        reference_id: 456,
      }

      expect(minimalInput.user_id).toBe(42)
      expect(minimalInput.type).toBe('recipe')
      expect(minimalInput.reference_id).toBe(456)
      expect(minimalInput.last_used).toBeUndefined()
      expect(minimalInput.times_used).toBeUndefined()
    })
  })

  describe('RecentFoodCreationParams', () => {
    it('should require essential fields and allow optional ones', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
      }

      expect(params.user_id).toBe(42)
      expect(params.type).toBe('food')
      expect(params.reference_id).toBe(123)
    })

    it('should allow partial record fields', () => {
      const params: RecentFoodCreationParams = {
        id: 1,
        user_id: 42,
        type: 'food',
        reference_id: 123,
        last_used: new Date('2023-01-01'),
        times_used: 5,
      }

      expect(params.id).toBe(1)
      expect(params.times_used).toBe(5)
      expect(params.last_used).toBeInstanceOf(Date)
    })
  })

  describe('RecentFoodRepository interface', () => {
    it('should define the expected repository methods', () => {
      const mockRepository: RecentFoodRepository = {
        fetchByUserTypeAndReferenceId: async (userId, type, referenceId) => {
          expect(typeof userId).toBe('number')
          expect(['food', 'recipe']).toContain(type)
          expect(typeof referenceId).toBe('number')
          return null
        },
        fetchUserRecentFoodsRaw: async (userId, search, opts) => {
          expect(typeof userId).toBe('number')
          expect(typeof search).toBe('string')
          if (opts) {
            expect(typeof opts).toBe('object')
          }
          return []
        },
        insert: async (input) => {
          expect(typeof input.user_id).toBe('number')
          expect(['food', 'recipe']).toContain(input.type)
          expect(typeof input.reference_id).toBe('number')
          return null
        },
        update: async (id, input) => {
          expect(typeof id).toBe('number')
          expect(typeof input.user_id).toBe('number')
          return null
        },
        deleteByReference: async (userId, type, referenceId) => {
          expect(typeof userId).toBe('number')
          expect(['food', 'recipe']).toContain(type)
          expect(typeof referenceId).toBe('number')
          return false
        },
      }

      expect(mockRepository).toBeDefined()
    })
  })

  describe('createRecentFoodInput', () => {
    it('should create a recent food input with default values', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
      }

      const beforeCreation = Date.now()
      const input = createRecentFoodInput(params)
      const afterCreation = Date.now()

      expect(input.user_id).toBe(42)
      expect(input.type).toBe('food')
      expect(input.reference_id).toBe(123)
      expect(input.last_used).toBeInstanceOf(Date)
      expect(input.times_used).toBe(1)

      // Check that last_used is approximately now
      const lastUsedTime = input.last_used!.getTime()
      expect(lastUsedTime).toBeGreaterThanOrEqual(beforeCreation)
      expect(lastUsedTime).toBeLessThanOrEqual(afterCreation)
    })

    it('should increment times_used when provided', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'recipe',
        reference_id: 456,
        times_used: 5,
      }

      const input = createRecentFoodInput(params)

      expect(input.times_used).toBe(6) // 5 + 1
    })

    it('should default times_used to 1 when not provided', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
      }

      const input = createRecentFoodInput(params)

      expect(input.times_used).toBe(1) // 0 + 1
    })

    it('should handle zero times_used', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
        times_used: 0,
      }

      const input = createRecentFoodInput(params)

      expect(input.times_used).toBe(1) // 0 + 1
    })

    it('should always set last_used to current date', () => {
      const pastDate = new Date('2020-01-01')
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
        last_used: pastDate,
      }

      const beforeCreation = Date.now()
      const input = createRecentFoodInput(params)
      const afterCreation = Date.now()

      // Should ignore the provided last_used and use current date
      const lastUsedTime = input.last_used!.getTime()
      expect(lastUsedTime).toBeGreaterThanOrEqual(beforeCreation)
      expect(lastUsedTime).toBeLessThanOrEqual(afterCreation)
      expect(lastUsedTime).not.toBe(pastDate.getTime())
    })

    it('should handle different user IDs', () => {
      const userIds = [1, 42, 999, 123456789]

      userIds.forEach((userId) => {
        const params: RecentFoodCreationParams = {
          user_id: userId,
          type: 'food',
          reference_id: 123,
        }

        const input = createRecentFoodInput(params)
        expect(input.user_id).toBe(userId)
      })
    })

    it('should handle different reference IDs', () => {
      const referenceIds = [1, 123, 456, 999999]

      referenceIds.forEach((referenceId) => {
        const params: RecentFoodCreationParams = {
          user_id: 42,
          type: 'recipe',
          reference_id: referenceId,
        }

        const input = createRecentFoodInput(params)
        expect(input.reference_id).toBe(referenceId)
      })
    })

    it('should handle both food and recipe types', () => {
      const types: RecentFoodType[] = ['food', 'recipe']

      types.forEach((type) => {
        const params: RecentFoodCreationParams = {
          user_id: 42,
          type,
          reference_id: 123,
        }

        const input = createRecentFoodInput(params)
        expect(input.type).toBe(type)
      })
    })

    it('should handle large times_used values', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
        times_used: 999999,
      }

      const input = createRecentFoodInput(params)

      expect(input.times_used).toBe(1000000) // 999999 + 1
    })

    it('should preserve all required properties', () => {
      const params: RecentFoodCreationParams = {
        user_id: 42,
        type: 'food',
        reference_id: 123,
        times_used: 10,
      }

      const input = createRecentFoodInput(params)

      // Check all required properties are present
      expect(input).toHaveProperty('user_id')
      expect(input).toHaveProperty('type')
      expect(input).toHaveProperty('reference_id')
      expect(input).toHaveProperty('last_used')
      expect(input).toHaveProperty('times_used')

      // Check no extra properties
      const expectedKeys = [
        'user_id',
        'type',
        'reference_id',
        'last_used',
        'times_used',
      ]
      expect(Object.keys(input).sort()).toEqual(expectedKeys.sort())
    })
  })

  describe('Edge cases and business rules', () => {
    it('should handle edge case user IDs', () => {
      const edgeCaseUserIds = [1, Number.MAX_SAFE_INTEGER]

      edgeCaseUserIds.forEach((userId) => {
        const params: RecentFoodCreationParams = {
          user_id: userId,
          type: 'food',
          reference_id: 123,
        }

        const input = createRecentFoodInput(params)
        expect(input.user_id).toBe(userId)
      })
    })

    it('should handle edge case reference IDs', () => {
      const edgeCaseReferenceIds = [1, Number.MAX_SAFE_INTEGER]

      edgeCaseReferenceIds.forEach((referenceId) => {
        const params: RecentFoodCreationParams = {
          user_id: 42,
          type: 'recipe',
          reference_id: referenceId,
        }

        const input = createRecentFoodInput(params)
        expect(input.reference_id).toBe(referenceId)
      })
    })

    it('should ensure times_used is always incremented', () => {
      const testCases = [
        { initial: undefined, expected: 1 },
        { initial: 0, expected: 1 },
        { initial: 1, expected: 2 },
        { initial: 99, expected: 100 },
      ]

      testCases.forEach(({ initial, expected }) => {
        const params: RecentFoodCreationParams = {
          user_id: 42,
          type: 'food',
          reference_id: 123,
          times_used: initial,
        }

        const input = createRecentFoodInput(params)
        expect(input.times_used).toBe(expected)
      })
    })

    it('should generate consistent structure regardless of input', () => {
      const minimalParams: RecentFoodCreationParams = {
        user_id: 1,
        type: 'food',
        reference_id: 1,
      }

      const fullParams: RecentFoodCreationParams = {
        id: 999,
        user_id: 2,
        type: 'recipe',
        reference_id: 2,
        last_used: new Date('2020-01-01'),
        times_used: 50,
      }

      const minimalInput = createRecentFoodInput(minimalParams)
      const fullInput = createRecentFoodInput(fullParams)

      // Both should have the same structure
      expect(Object.keys(minimalInput).sort()).toEqual(
        Object.keys(fullInput).sort(),
      )

      // Both should have the same types
      expect(typeof minimalInput.user_id).toBe('number')
      expect(typeof minimalInput.type).toBe('string')
      expect(typeof minimalInput.reference_id).toBe('number')
      expect(minimalInput.last_used).toBeInstanceOf(Date)
      expect(typeof minimalInput.times_used).toBe('number')

      expect(typeof fullInput.user_id).toBe('number')
      expect(typeof fullInput.type).toBe('string')
      expect(typeof fullInput.reference_id).toBe('number')
      expect(fullInput.last_used).toBeInstanceOf(Date)
      expect(typeof fullInput.times_used).toBe('number')
    })
  })

  describe('Type consistency', () => {
    it('should ensure RecentFoodInput can be used with repository methods', () => {
      const input: RecentFoodInput = createRecentFoodInput({
        user_id: 42,
        type: 'food',
        reference_id: 123,
      })

      // This should compile without type errors
      const mockInsert = async (input: RecentFoodInput) => {
        expect(input).toBeDefined()
        return null
      }

      const mockUpdate = async (id: number, input: RecentFoodInput) => {
        expect(id).toBeDefined()
        expect(input).toBeDefined()
        return null
      }

      expect(() => mockInsert(input)).not.toThrow()
      expect(() => mockUpdate(1, input)).not.toThrow()
    })

    it('should ensure RecentFoodCreationParams accepts partial records', () => {
      const fullRecord: RecentFoodRecord = {
        id: 1,
        user_id: 42,
        type: 'food',
        reference_id: 123,
        last_used: new Date(),
        times_used: 5,
      }

      // This should be valid RecentFoodCreationParams
      const params: RecentFoodCreationParams = {
        user_id: fullRecord.user_id,
        type: fullRecord.type,
        reference_id: fullRecord.reference_id,
        times_used: fullRecord.times_used,
      }

      const input = createRecentFoodInput(params)
      expect(input.user_id).toBe(fullRecord.user_id)
      expect(input.type).toBe(fullRecord.type)
      expect(input.reference_id).toBe(fullRecord.reference_id)
    })
  })
})
