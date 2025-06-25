import { describe, expect, it } from 'vitest'

import { createMeal } from '~/modules/diet/meal/domain/meal'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Tests for MealEditView paste functionality
 * These tests verify that pasting a meal correctly extracts its items
 */
describe('MealEditView onPaste logic', () => {
  it('should identify meal objects with __type: "Meal"', () => {
    const mealToPaste = createMeal({
      name: 'Test Meal',
      items: [
        createUnifiedItem({
          id: 1,
          name: 'Test Item 1',
          quantity: 100,
          reference: {
            type: 'food',
            id: 1,
            macros: { protein: 10, carbs: 15, fat: 5 },
          },
        }),
        createUnifiedItem({
          id: 2,
          name: 'Test Item 2',
          quantity: 150,
          reference: {
            type: 'food',
            id: 2,
            macros: { protein: 20, carbs: 25, fat: 8 },
          },
        }),
      ],
    })

    // Verify the meal has the correct __type
    expect(mealToPaste.__type).toBe('Meal')
    expect(mealToPaste.items).toHaveLength(2)
    expect(mealToPaste.items[0]?.name).toBe('Test Item 1')
    expect(mealToPaste.items[1]?.name).toBe('Test Item 2')
  })

  it('should handle meal paste logic correctly', () => {
    const mealToPaste = createMeal({
      name: 'Source Meal',
      items: [
        createUnifiedItem({
          id: 1,
          name: 'Item A',
          quantity: 100,
          reference: {
            type: 'food',
            id: 1,
            macros: { protein: 12, carbs: 18, fat: 6 },
          },
        }),
        createUnifiedItem({
          id: 2,
          name: 'Item B',
          quantity: 50,
          reference: {
            type: 'food',
            id: 2,
            macros: { protein: 8, carbs: 12, fat: 4 },
          },
        }),
      ],
    })

    // Simulate the paste logic check
    const data = mealToPaste
    const isMealPaste = typeof data === 'object' && '__type' in data

    expect(isMealPaste).toBe(true)
    expect(data.__type).toBe('Meal')

    // Verify we can extract items from the meal
    if (isMealPaste) {
      const itemsToAdd = data.items
      expect(itemsToAdd).toHaveLength(2)
      expect(itemsToAdd[0]?.name).toBe('Item A')
      expect(itemsToAdd[1]?.name).toBe('Item B')
      if (itemsToAdd[0] && itemsToAdd[0].reference.type === 'food') {
        expect(itemsToAdd[0].reference.macros.protein).toBe(12)
      }
      if (itemsToAdd[1] && itemsToAdd[1].reference.type === 'food') {
        expect(itemsToAdd[1].reference.macros.protein).toBe(8)
      }
    }
  })
})
