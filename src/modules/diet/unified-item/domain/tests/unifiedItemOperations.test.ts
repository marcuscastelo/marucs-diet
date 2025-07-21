import { describe, expect, it } from 'vitest'

import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createUnifiedItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

import {
  compareUnifiedItemArrays,
  generateUnifiedItemId,
  regenerateUnifiedItemIds,
  synchronizeRecipeItemWithOriginal,
} from '../unifiedItemOperations'

describe('compareUnifiedItemArrays', () => {
  const createFoodItem = (id: number, name: string, quantity: number) =>
    createUnifiedItem({
      id,
      name,
      quantity,
      reference: {
        type: 'food',
        id,
        macros: createMacroNutrients({
          protein: 10,
          carbs: 20,
          fat: 5,
        }),
      },
    })

  const createRecipeItem = (
    id: number,
    name: string,
    quantity: number,
    children: UnifiedItem[] = [],
  ) =>
    createUnifiedItem({
      id,
      name,
      quantity,
      reference: {
        type: 'recipe',
        id,
        children,
      },
    })

  it('returns true for identical arrays', () => {
    const items1 = [
      createFoodItem(1, 'Apple', 100),
      createFoodItem(2, 'Banana', 150),
    ]
    const items2 = [
      createFoodItem(1, 'Apple', 100),
      createFoodItem(2, 'Banana', 150),
    ]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(true)
  })

  it('returns true for arrays with same items in different order', () => {
    const items1 = [
      createFoodItem(1, 'Apple', 100),
      createFoodItem(2, 'Banana', 150),
    ]
    const items2 = [
      createFoodItem(2, 'Banana', 150),
      createFoodItem(1, 'Apple', 100),
    ]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(true)
  })

  it('returns false for arrays with different lengths', () => {
    const items1 = [createFoodItem(1, 'Apple', 100)]
    const items2 = [
      createFoodItem(1, 'Apple', 100),
      createFoodItem(2, 'Banana', 150),
    ]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(false)
  })

  it('returns false when quantities differ', () => {
    const items1 = [createFoodItem(1, 'Apple', 100)]
    const items2 = [createFoodItem(1, 'Apple', 200)]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(false)
  })

  it('returns false when names differ', () => {
    const items1 = [createFoodItem(1, 'Apple', 100)]
    const items2 = [createFoodItem(1, 'Orange', 100)]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(false)
  })

  it('returns false when macros differ', () => {
    const item1 = createUnifiedItem({
      id: 1,
      name: 'Apple',
      quantity: 100,
      reference: {
        type: 'food',
        id: 1,
        macros: createMacroNutrients({
          protein: 10,
          carbs: 20,
          fat: 5,
        }),
      },
    })

    const item2 = createUnifiedItem({
      id: 1,
      name: 'Apple',
      quantity: 100,
      reference: {
        type: 'food',
        id: 1,
        macros: createMacroNutrients({
          protein: 15, // Different protein
          carbs: 20,
          fat: 5,
        }),
      },
    })

    expect(compareUnifiedItemArrays([item1], [item2])).toBe(false)
  })

  it('returns true for identical recipe items with children', () => {
    const children = [createFoodItem(10, 'Flour', 200)]
    const items1 = [createRecipeItem(1, 'Bread', 500, children)]
    const items2 = [createRecipeItem(1, 'Bread', 500, children)]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(true)
  })

  it('returns false when recipe children differ', () => {
    const children1 = [createFoodItem(10, 'Flour', 200)]
    const children2 = [createFoodItem(10, 'Flour', 300)] // Different quantity
    const items1 = [createRecipeItem(1, 'Bread', 500, children1)]
    const items2 = [createRecipeItem(1, 'Bread', 500, children2)]

    expect(compareUnifiedItemArrays(items1, items2)).toBe(false)
  })
})

describe('generateUnifiedItemId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateUnifiedItemId()
    const id2 = generateUnifiedItemId()

    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('number')
    expect(typeof id2).toBe('number')
  })
})

describe('regenerateUnifiedItemIds', () => {
  it('should regenerate ID for food item', () => {
    const foodItem: UnifiedItem = {
      id: 1,
      name: 'Apple',
      quantity: 100,
      reference: {
        type: 'food',
        id: 10,
        macros: createMacroNutrients({ protein: 1, carbs: 25, fat: 0 }),
      },
      __type: 'UnifiedItem',
    }

    const regenerated = regenerateUnifiedItemIds(foodItem)

    expect(regenerated.id).not.toBe(foodItem.id)
    expect(regenerated.name).toBe(foodItem.name)
    expect(regenerated.quantity).toBe(foodItem.quantity)
    expect(regenerated.reference).toEqual(foodItem.reference)
  })

  it('should recursively regenerate IDs for recipe item children', () => {
    const childFood: UnifiedItem = {
      id: 2,
      name: 'Banana',
      quantity: 50,
      reference: {
        type: 'food',
        id: 20,
        macros: createMacroNutrients({ protein: 1, carbs: 12, fat: 0 }),
      },
      __type: 'UnifiedItem',
    }

    const recipeItem: UnifiedItem = {
      id: 1,
      name: 'Fruit Bowl',
      quantity: 1,
      reference: {
        type: 'recipe',
        id: 100,
        children: [childFood],
      },
      __type: 'UnifiedItem',
    }

    const regenerated = regenerateUnifiedItemIds(recipeItem)

    expect(regenerated.id).not.toBe(recipeItem.id)
    expect(regenerated.reference.type).toBe('recipe')
    if (regenerated.reference.type === 'recipe') {
      expect(regenerated.reference.children).toHaveLength(1)
      expect(regenerated.reference.children[0]!.id).not.toBe(childFood.id)
      expect(regenerated.reference.children[0]!.name).toBe(childFood.name)
    }
  })
})

describe('synchronizeRecipeItemWithOriginal', () => {
  it('should synchronize recipe item with original items', () => {
    const originalItems: UnifiedItem[] = [
      {
        id: 100,
        name: 'Original Apple',
        quantity: 200,
        reference: {
          type: 'food',
          id: 10,
          macros: createMacroNutrients({ protein: 2, carbs: 50, fat: 0 }),
        },
        __type: 'UnifiedItem',
      },
    ]

    const modifiedChild: UnifiedItem = {
      id: 100,
      name: 'Modified Apple', // Name changed
      quantity: 150, // Quantity changed
      reference: {
        type: 'food',
        id: 10,
        macros: createMacroNutrients({ protein: 2, carbs: 37.5, fat: 0 }), // Macros changed
      },
      __type: 'UnifiedItem',
    }

    const recipeItem: UnifiedItem = {
      id: 1,
      name: 'Apple Recipe',
      quantity: 1,
      reference: {
        type: 'recipe',
        id: 500,
        children: [modifiedChild], // Contains modified version
      },
      __type: 'UnifiedItem',
    }

    const synchronized = synchronizeRecipeItemWithOriginal(
      recipeItem,
      originalItems,
    )

    expect(synchronized.reference.type).toBe('recipe')
    if (synchronized.reference.type === 'recipe') {
      expect(synchronized.reference.children).toHaveLength(1)
      const syncedChild = synchronized.reference.children[0]!

      // Should have original values (but new ID)
      expect(syncedChild.id).not.toBe(originalItems[0]!.id) // New ID
      expect(syncedChild.name).toBe('Original Apple') // Original name
      expect(syncedChild.quantity).toBe(200) // Original quantity

      if (syncedChild.reference.type === 'food') {
        expect(syncedChild.reference.macros).toEqual(
          createMacroNutrients({ protein: 2, carbs: 50, fat: 0 }),
        ) // Original macros
      }
    }
  })

  it('should throw error for non-recipe items', () => {
    const foodItem: UnifiedItem = {
      id: 1,
      name: 'Apple',
      quantity: 100,
      reference: {
        type: 'food',
        id: 10,
        macros: createMacroNutrients({ protein: 1, carbs: 25, fat: 0 }),
      },
      __type: 'UnifiedItem',
    }

    expect(() => {
      synchronizeRecipeItemWithOriginal(foodItem, [])
    }).toThrow('Can only synchronize recipe items')
  })
})
