import { describe, expect, it } from 'vitest'

import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createNewUnifiedRecipe,
  promoteToUnifiedRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import {
  addUnifiedItemsToRecipe,
  addUnifiedItemToRecipe,
  clearUnifiedRecipeItems,
  findUnifiedItemInRecipe,
  getUnifiedRecipePreparedQuantity,
  getUnifiedRecipeRawQuantity,
  removeUnifiedItemFromRecipe,
  scaleUnifiedRecipeByPreparedQuantity,
  setUnifiedRecipeItems,
  updateUnifiedItemInRecipe,
  updateUnifiedRecipeName,
  updateUnifiedRecipePreparedMultiplier,
} from '~/modules/diet/recipe/domain/unifiedRecipeOperations'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('unifiedRecipeOperations', () => {
  const mockUnifiedItem1 = createUnifiedItem({
    id: 1,
    name: 'Flour',
    quantity: 100,
    reference: {
      type: 'food',
      id: 1,
      macros: createMacroNutrients({ carbs: 70, protein: 10, fat: 1 }),
    },
  })

  const mockUnifiedItem2 = createUnifiedItem({
    id: 2,
    name: 'Sugar',
    quantity: 50,
    reference: {
      type: 'food',
      id: 2,
      macros: createMacroNutrients({ carbs: 99, protein: 0, fat: 0 }),
    },
  })

  const makeUnifiedRecipe = () => {
    const newRecipe = createNewUnifiedRecipe({
      name: 'Test Recipe',
      items: [mockUnifiedItem1],
      owner: 1,
      prepared_multiplier: 0.8,
    })
    return promoteToUnifiedRecipe(newRecipe, { id: 1 })
  }

  describe('addUnifiedItemToRecipe', () => {
    it('should add an item to the recipe', () => {
      const recipe = makeUnifiedRecipe()
      const updatedRecipe = addUnifiedItemToRecipe(recipe, mockUnifiedItem2)

      expect(updatedRecipe.items).toHaveLength(2)
      expect(updatedRecipe.items[1]).toEqual(mockUnifiedItem2)
    })
  })

  describe('addUnifiedItemsToRecipe', () => {
    it('should add multiple items to the recipe', () => {
      const recipe = makeUnifiedRecipe()
      const newItems = [mockUnifiedItem2]
      const updatedRecipe = addUnifiedItemsToRecipe(recipe, newItems)

      expect(updatedRecipe.items).toHaveLength(2)
      expect(updatedRecipe.items[1]).toEqual(mockUnifiedItem2)
    })
  })

  describe('updateUnifiedItemInRecipe', () => {
    it('should update an existing item in the recipe', () => {
      const recipe = makeUnifiedRecipe()
      const updatedItem = { ...mockUnifiedItem1, quantity: 200 }
      const updatedRecipe = updateUnifiedItemInRecipe(recipe, 1, updatedItem)

      expect(updatedRecipe.items[0]?.quantity).toBe(200)
    })

    it('should not change other items when updating one item', () => {
      const recipe = addUnifiedItemToRecipe(
        makeUnifiedRecipe(),
        mockUnifiedItem2,
      )
      const updatedItem = { ...mockUnifiedItem1, quantity: 200 }
      const updatedRecipe = updateUnifiedItemInRecipe(recipe, 1, updatedItem)

      expect(updatedRecipe.items[0]?.quantity).toBe(200)
      expect(updatedRecipe.items[1]).toEqual(mockUnifiedItem2)
    })
  })

  describe('removeUnifiedItemFromRecipe', () => {
    it('should remove an item from the recipe', () => {
      const recipe = addUnifiedItemToRecipe(
        makeUnifiedRecipe(),
        mockUnifiedItem2,
      )
      const updatedRecipe = removeUnifiedItemFromRecipe(recipe, 1)

      expect(updatedRecipe.items).toHaveLength(1)
      expect(updatedRecipe.items[0]).toEqual(mockUnifiedItem2)
    })
  })

  describe('setUnifiedRecipeItems', () => {
    it('should replace all items in the recipe', () => {
      const recipe = makeUnifiedRecipe()
      const newItems = [mockUnifiedItem2]
      const updatedRecipe = setUnifiedRecipeItems(recipe, newItems)

      expect(updatedRecipe.items).toHaveLength(1)
      expect(updatedRecipe.items[0]).toEqual(mockUnifiedItem2)
    })
  })

  describe('clearUnifiedRecipeItems', () => {
    it('should remove all items from the recipe', () => {
      const recipe = makeUnifiedRecipe()
      const updatedRecipe = clearUnifiedRecipeItems(recipe)

      expect(updatedRecipe.items).toHaveLength(0)
    })
  })

  describe('findUnifiedItemInRecipe', () => {
    it('should find an existing item in the recipe', () => {
      const recipe = makeUnifiedRecipe()
      const foundItem = findUnifiedItemInRecipe(recipe, 1)

      expect(foundItem).toEqual(mockUnifiedItem1)
    })

    it('should return undefined for non-existing item', () => {
      const recipe = makeUnifiedRecipe()
      const foundItem = findUnifiedItemInRecipe(recipe, 999)

      expect(foundItem).toBeUndefined()
    })
  })

  describe('updateUnifiedRecipeName', () => {
    it('should update the recipe name', () => {
      const recipe = makeUnifiedRecipe()
      const updatedRecipe = updateUnifiedRecipeName(recipe, 'New Recipe Name')

      expect(updatedRecipe.name).toBe('New Recipe Name')
      expect(updatedRecipe.items).toEqual(recipe.items)
    })
  })

  describe('updateUnifiedRecipeprepared_multiplier', () => {
    it('should update the prepared multiplier', () => {
      const recipe = makeUnifiedRecipe()
      const updatedRecipe = updateUnifiedRecipePreparedMultiplier(recipe, 1.2)

      expect(updatedRecipe.prepared_multiplier).toBe(1.2)
      expect(updatedRecipe.items).toEqual(recipe.items)
    })
  })

  describe('getUnifiedRecipeRawQuantity', () => {
    it('should calculate total raw quantity', () => {
      const recipe = addUnifiedItemToRecipe(
        makeUnifiedRecipe(),
        mockUnifiedItem2,
      )
      const rawQuantity = getUnifiedRecipeRawQuantity(recipe)

      expect(rawQuantity).toBe(150) // 100 + 50
    })
  })

  describe('getUnifiedRecipePreparedQuantity', () => {
    it('should calculate prepared quantity using multiplier', () => {
      const recipe = makeUnifiedRecipe() // has prepared_multiplier of 0.8
      const preparedQuantity = getUnifiedRecipePreparedQuantity(recipe)

      expect(preparedQuantity).toBe(80) // 100 * 0.8
    })
  })

  describe('scaleUnifiedRecipeByPreparedQuantity', () => {
    it('should scale recipe items based on desired prepared quantity', () => {
      const recipe = addUnifiedItemToRecipe(
        makeUnifiedRecipe(),
        mockUnifiedItem2,
      )
      // Raw: 150g, Prepared: 120g (150 * 0.8), Desired: 240g
      const { scaledItems, scalingFactor } =
        scaleUnifiedRecipeByPreparedQuantity(recipe, 240)

      expect(scalingFactor).toBe(2) // 240 / 120
      expect(scaledItems).toHaveLength(2)
      expect(scaledItems[0]?.quantity).toBe(200) // 100 * 2
      expect(scaledItems[1]?.quantity).toBe(100) // 50 * 2
    })

    it('should throw error for zero prepared quantity', () => {
      const recipe = clearUnifiedRecipeItems(makeUnifiedRecipe())
      expect(() => scaleUnifiedRecipeByPreparedQuantity(recipe, 100)).toThrow(
        'Recipe prepared quantity must be greater than 0',
      )
    })

    it('should throw error for negative desired quantity', () => {
      const recipe = makeUnifiedRecipe()
      expect(() => scaleUnifiedRecipeByPreparedQuantity(recipe, -10)).toThrow(
        'Desired prepared quantity must be non-negative',
      )
    })
  })
})
