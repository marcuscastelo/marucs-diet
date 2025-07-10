import { describe, expect, it } from 'vitest'

import { createItem, type Item } from '~/modules/diet/item/domain/item'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createNewRecipe,
  promoteToRecipe,
  type Recipe,
} from '~/modules/diet/recipe/domain/recipe'
import {
  addItemsToRecipe,
  addItemToRecipe,
  clearRecipeItems,
  createScaledRecipe,
  findItemInRecipe,
  getRecipePreparedQuantity,
  getRecipeRawQuantity,
  removeItemFromRecipe,
  replaceRecipe,
  scaleRecipeByPreparedQuantity,
  setRecipeItems,
  updateItemInRecipe,
  updateRecipeName,
  updateRecipePreparedMultiplier,
} from '~/modules/diet/recipe/domain/recipeOperations'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
      name,
      reference: id,
      quantity: 100,
      macros: createMacroNutrients({ carbs: 10, protein: 2, fat: 1 }),
    }),
    id,
  }
}
const baseItem = makeItem(1)
const baseRecipe = promoteToRecipe(
  createNewRecipe({
    name: 'Receita',
    owner: 1,
    items: [baseItem],
    prepared_multiplier: 1,
  }),
  { id: 1 },
)

describe('recipeOperations', () => {
  it('updateRecipeName updates name', () => {
    const result = updateRecipeName(baseRecipe, 'Novo')
    expect(result.name).toBe('Novo')
  })

  it('updateRecipeprepared_multiplier updates multiplier', () => {
    const result = updateRecipePreparedMultiplier(baseRecipe, 2)
    expect(result.prepared_multiplier).toBe(2)
  })

  it('addItemToRecipe adds item', () => {
    const item = makeItem(2)
    const result = addItemToRecipe(baseRecipe, item)
    expect(result.items).toHaveLength(2)
  })

  it('addItemsToRecipe adds items', () => {
    const items = [makeItem(2), makeItem(3)]
    const result = addItemsToRecipe(baseRecipe, items)
    expect(result.items).toHaveLength(3)
  })

  it('updateItemInRecipe updates item', () => {
    const updated = makeItem(1, 'Feijão')
    const result = updateItemInRecipe(baseRecipe, 1, updated)
    expect(result.items[0]?.name).toBe('Feijão')
  })

  it('removeItemFromRecipe removes item', () => {
    const result = removeItemFromRecipe(baseRecipe, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setRecipeItems sets items', () => {
    const items = [makeItem(2)]
    const result = setRecipeItems(baseRecipe, items)
    expect(result.items).toEqual(items)
  })

  it('clearRecipeItems clears items', () => {
    const result = clearRecipeItems(baseRecipe)
    expect(result.items).toEqual([])
  })

  it('findItemInRecipe finds item', () => {
    const found = findItemInRecipe(baseRecipe, 1)
    expect(found).toEqual(baseItem)
  })

  it('replaceRecipe replaces fields', () => {
    const result = replaceRecipe(baseRecipe, { name: 'Novo' })
    expect(result.name).toBe('Novo')
  })

  it('addItemToRecipe works for complex recipes (prepared_multiplier !== 1)', () => {
    const complexRecipe = promoteToRecipe(
      createNewRecipe({
        name: 'Complexa',
        owner: 1,
        items: [baseItem],
        prepared_multiplier: 2,
      }),
      { id: 2 },
    )
    const item = makeItem(99, 'Novo')
    const result = addItemToRecipe(complexRecipe, item)
    expect(result.items).toHaveLength(2)
    expect(result.prepared_multiplier).toBe(2)
  })

  it('addItemsToRecipe works for complex recipes (prepared_multiplier !== 1)', () => {
    const complexRecipe = promoteToRecipe(
      createNewRecipe({
        name: 'Complexa',
        owner: 1,
        items: [baseItem],
        prepared_multiplier: 3,
      }),
      { id: 3 },
    )
    const items = [makeItem(100, 'A'), makeItem(101, 'B')]
    const result = addItemsToRecipe(complexRecipe, items)
    expect(result.items).toHaveLength(3)
    expect(result.prepared_multiplier).toBe(3)
  })
})

describe('Recipe scaling operations', () => {
  const makeRecipe = (items: Item[], prepared_multiplier = 1): Recipe => {
    return promoteToRecipe(
      createNewRecipe({
        name: 'Test Recipe',
        owner: 1,
        items,
        prepared_multiplier,
      }),
      { id: 1 },
    )
  }

  describe('getRecipeRawQuantity', () => {
    it('calculates total raw quantity correctly', () => {
      const items = [makeItem(1, 'A'), makeItem(2, 'B')] // 100g + 100g = 200g
      const recipe = makeRecipe(items)
      expect(getRecipeRawQuantity(recipe)).toBe(200)
    })

    it('returns 0 for empty recipe', () => {
      const recipe = makeRecipe([])
      expect(getRecipeRawQuantity(recipe)).toBe(0)
    })
  })

  describe('getRecipePreparedQuantity', () => {
    it('calculates prepared quantity with multiplier 1', () => {
      const items = [makeItem(1, 'A'), makeItem(2, 'B')] // 200g raw
      const recipe = makeRecipe(items, 1)
      expect(getRecipePreparedQuantity(recipe)).toBe(200) // 200g * 1 = 200g
    })

    it('calculates prepared quantity with multiplier < 1', () => {
      const items = [makeItem(1, 'A'), makeItem(2, 'B')] // 200g raw
      const recipe = makeRecipe(items, 0.8)
      expect(getRecipePreparedQuantity(recipe)).toBe(160) // 200g * 0.8 = 160g
    })

    it('calculates prepared quantity with multiplier > 1', () => {
      const items = [makeItem(1, 'A')] // 100g raw
      const recipe = makeRecipe(items, 1.5)
      expect(getRecipePreparedQuantity(recipe)).toBe(150) // 100g * 1.5 = 150g
    })
  })

  describe('scaleRecipeByPreparedQuantity', () => {
    it('scales recipe items correctly', () => {
      const items = [
        { ...makeItem(1, 'A'), quantity: 100 }, // 100g
        { ...makeItem(2, 'B'), quantity: 200 }, // 200g
      ] // Total: 300g raw, 240g prepared (300 * 0.8)
      const recipe = makeRecipe(items, 0.8)

      const result = scaleRecipeByPreparedQuantity(recipe, 120) // Want half

      expect(result.scalingFactor).toBe(0.5) // 120 / 240 = 0.5
      expect(result.scaledItems).toHaveLength(2)
      expect(result.scaledItems[0]?.quantity).toBe(50) // 100 * 0.5
      expect(result.scaledItems[1]?.quantity).toBe(100) // 200 * 0.5
    })

    it('handles scaling factor 1 (same quantity)', () => {
      const items = [{ ...makeItem(1, 'A'), quantity: 100 }]
      const recipe = makeRecipe(items, 0.8) // 100g raw, 80g prepared

      const result = scaleRecipeByPreparedQuantity(recipe, 80)

      expect(result.scalingFactor).toBe(1)
      expect(result.scaledItems[0]?.quantity).toBe(100)
    })

    it('handles zero desired quantity', () => {
      const items = [{ ...makeItem(1, 'A'), quantity: 100 }]
      const recipe = makeRecipe(items, 0.8)

      const result = scaleRecipeByPreparedQuantity(recipe, 0)

      expect(result.scalingFactor).toBe(0)
      expect(result.scaledItems[0]?.quantity).toBe(0)
    })

    it('throws error for negative desired quantity', () => {
      const items = [{ ...makeItem(1, 'A'), quantity: 100 }]
      const recipe = makeRecipe(items, 0.8)

      expect(() => scaleRecipeByPreparedQuantity(recipe, -10)).toThrow(
        'Desired prepared quantity must be non-negative',
      )
    })

    it('throws error for zero prepared quantity', () => {
      const items = [{ ...makeItem(1, 'A'), quantity: 0 }]
      const recipe = makeRecipe(items, 0.8) // 0 * 0.8 = 0

      expect(() => scaleRecipeByPreparedQuantity(recipe, 100)).toThrow(
        'Recipe prepared quantity must be greater than 0',
      )
    })
  })

  describe('createScaledRecipe', () => {
    it('creates scaled recipe with correct properties', () => {
      const items = [
        { ...makeItem(1, 'A'), quantity: 100 },
        { ...makeItem(2, 'B'), quantity: 200 },
      ]
      const recipe = makeRecipe(items, 0.8)

      const scaledRecipe = createScaledRecipe(recipe, 120) // Half of 240g prepared

      expect(scaledRecipe.name).toBe('Test Recipe')
      expect(scaledRecipe.prepared_multiplier).toBe(0.8) // Multiplier stays same
      expect(scaledRecipe.items).toHaveLength(2)
      expect(scaledRecipe.items[0]?.quantity).toBe(50)
      expect(scaledRecipe.items[1]?.quantity).toBe(100)
    })
  })
})
