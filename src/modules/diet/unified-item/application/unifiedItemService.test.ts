import { describe, expect, it } from 'vitest'

import {
  calculateTotalMacros,
  filterItemsByType,
  findUnifiedItemById,
  groupUnifiedItemsByType,
  removeUnifiedItemFromArray,
  scaleUnifiedItem,
  sortUnifiedItems,
  updateUnifiedItemInArray,
} from '~/modules/diet/unified-item/application/unifiedItemService'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { calcUnifiedItemMacros } from '~/shared/utils/macroMath'

describe('unifiedItemService', () => {
  const foodItem: UnifiedItem = createUnifiedItem({
    id: 1,
    name: 'Arroz',
    quantity: 100,
    reference: {
      type: 'food',
      id: 1,
      macros: { carbs: 10, protein: 2, fat: 1 },
    },
  })

  const recipeItem: UnifiedItem = createUnifiedItem({
    id: 2,
    name: 'Recipe Test',
    quantity: 200,
    reference: {
      type: 'recipe',
      id: 1,
      children: [
        createUnifiedItem({
          id: 4,
          name: 'Recipe Child',
          quantity: 100,
          reference: {
            type: 'food',
            id: 4,
            macros: { carbs: 20, protein: 4, fat: 2 },
          },
        }),
      ],
    },
  })

  const groupItem: UnifiedItem = createUnifiedItem({
    id: 3,
    name: 'Group Test',
    quantity: 150,
    reference: { type: 'group', children: [foodItem] },
  })

  const items = [foodItem, recipeItem, groupItem]

  describe('calculateTotalMacros', () => {
    it('calculates total macros for array of items', () => {
      const result = calculateTotalMacros([foodItem, recipeItem])

      // foodItem: (10*100)/100 = 10 carbs, (2*100)/100 = 2 protein, (1*100)/100 = 1 fat
      // recipeItem: Recipe with 200g quantity, child has 100g with 20 carbs/100g
      // Default recipe quantity = 100g (child sum), actual quantity = 200g
      // Scaled child macros: (200/100) * 20 = 40 carbs, (200/100) * 4 = 8 protein, (200/100) * 2 = 4 fat
      // Total: 10+40=50 carbs, 2+8=10 protein, 1+4=5 fat
      expect(result.carbs).toBeCloseTo(50)
      expect(result.protein).toBeCloseTo(10)
      expect(result.fat).toBeCloseTo(5)
    })

    it('returns zero macros for empty array', () => {
      const result = calculateTotalMacros([])
      expect(result).toEqual({ carbs: 0, protein: 0, fat: 0 })
    })
  })

  describe('filterItemsByType', () => {
    it('filters food items', () => {
      const result = filterItemsByType(items, 'food')
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Arroz')
    })

    it('filters recipe items', () => {
      const result = filterItemsByType(items, 'recipe')
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Recipe Test')
    })

    it('filters group items', () => {
      const result = filterItemsByType(items, 'group')
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Group Test')
    })
  })

  describe('scaleUnifiedItem', () => {
    it('scales item quantity and macros', () => {
      const result = scaleUnifiedItem(foodItem, 2)
      const resultMacros = calcUnifiedItemMacros(result)

      expect(result.quantity).toBe(200)
      expect(resultMacros.carbs).toBe(20)
      expect(resultMacros.protein).toBe(4)
      expect(resultMacros.fat).toBe(2)
      expect(result.name).toBe(foodItem.name)
    })

    it('scales with fractional factor', () => {
      const result = scaleUnifiedItem(foodItem, 0.5)
      const resultMacros = calcUnifiedItemMacros(result)

      expect(result.quantity).toBe(50)
      expect(resultMacros.carbs).toBe(5)
      expect(resultMacros.protein).toBe(1)
      expect(resultMacros.fat).toBe(0.5)
    })
  })

  describe('updateUnifiedItemInArray', () => {
    it('updates item by id', () => {
      const result = updateUnifiedItemInArray(items, 1, {
        name: 'Arroz Integral',
      })

      expect(result).toHaveLength(3)
      expect(result[0]?.name).toBe('Arroz Integral')
      expect(result[1]?.name).toBe('Recipe Test') // unchanged
    })

    it('returns original array if item not found', () => {
      const result = updateUnifiedItemInArray(items, 999, { name: 'Not Found' })
      expect(result).toEqual(items)
    })
  })

  describe('removeUnifiedItemFromArray', () => {
    it('removes item by id', () => {
      const result = removeUnifiedItemFromArray(items, 1)

      expect(result).toHaveLength(2)
      expect(result.map((item) => item.name)).not.toContain('Arroz')
    })

    it('returns original array if item not found', () => {
      const result = removeUnifiedItemFromArray(items, 999)
      expect(result).toHaveLength(3)
    })
  })

  describe('findUnifiedItemById', () => {
    it('finds item by id', () => {
      const result = findUnifiedItemById(items, 2)
      expect(result?.name).toBe('Recipe Test')
    })

    it('returns undefined if not found', () => {
      const result = findUnifiedItemById(items, 999)
      expect(result).toBeUndefined()
    })
  })

  describe('sortUnifiedItems', () => {
    it('sorts by name ascending', () => {
      const result = sortUnifiedItems(items, 'name', 'asc')
      expect(result.map((item) => item.name)).toEqual([
        'Arroz',
        'Group Test',
        'Recipe Test',
      ])
    })

    it('sorts by name descending', () => {
      const result = sortUnifiedItems(items, 'name', 'desc')
      expect(result.map((item) => item.name)).toEqual([
        'Recipe Test',
        'Group Test',
        'Arroz',
      ])
    })

    it('sorts by quantity', () => {
      const result = sortUnifiedItems(items, 'quantity', 'asc')
      expect(result.map((item) => item.quantity)).toEqual([100, 150, 200])
    })

    it('sorts by macros', () => {
      const result = sortUnifiedItems(items, 'carbs', 'desc')
      // recipeItem: 40 carbs (scaled), groupItem: 15 carbs (150g of 10 carbs/100g), foodItem: 10 carbs
      expect(result.map((item) => calcUnifiedItemMacros(item).carbs)).toEqual([
        40, 15, 10,
      ])
    })
  })

  describe('groupUnifiedItemsByType', () => {
    it('groups items by reference type', () => {
      const result = groupUnifiedItemsByType(items)

      expect(result.foods).toHaveLength(1)
      expect(result.recipes).toHaveLength(1)
      expect(result.groups).toHaveLength(1)

      expect(result.foods[0]?.name).toBe('Arroz')
      expect(result.recipes[0]?.name).toBe('Recipe Test')
      expect(result.groups[0]?.name).toBe('Group Test')
    })
  })
})
