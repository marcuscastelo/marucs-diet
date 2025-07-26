import { describe, expect, it } from 'vitest'

import {
  createRecentFoodInput,
  type RecentFoodCreationParams,
} from '~/modules/recent-food/domain/recentFood'

describe('Recent Food Domain', () => {
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
  })
})
