import { describe, expect, it } from 'vitest'

import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createUnifiedItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

import { compareUnifiedItemArrays } from '../unifiedItemOperations'

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
