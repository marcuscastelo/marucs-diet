import { describe, expect, it } from 'vitest'

import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { createUnifiedItemFromTemplate } from '~/modules/diet/template/application/createGroupFromTemplate'
import { templateToUnifiedItem as templateToUnifiedItemDirect } from '~/modules/diet/template/application/templateToItem'
import { unifiedItemToItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  FoodItem,
  RecipeItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('template application services', () => {
  const baseItem = {
    name: 'Arroz',
    quantity: 100,
    id: 1,
    reference: {
      type: 'food',
      id: 1,
      macros: { carbs: 10, protein: 2, fat: 1 },
    },
    __type: 'UnifiedItem' as const,
  } satisfies FoodItem

  const foodTemplate = {
    id: 1,
    name: 'Arroz',
    macros: { carbs: 10, protein: 2, fat: 1 },
    ean: null,
    __type: 'Food' as const,
  }

  const recipeTemplate: Recipe = {
    id: 2,
    name: 'Recipe Test',
    owner: 1,
    items: [unifiedItemToItem(baseItem)],
    prepared_multiplier: 2,
    __type: 'Recipe',
  }

  describe('createUnifiedItemFromTemplate', () => {
    it('creates unified item from food template', () => {
      const result = createUnifiedItemFromTemplate(foodTemplate, baseItem)

      expect(result.unifiedItem).toBeDefined()
      expect(result.unifiedItem.name).toBe('Arroz')
      expect(result.unifiedItem.quantity).toBe(100)
      expect(result.unifiedItem.reference.type).toBe('food')
      if (result.unifiedItem.reference.type === 'food') {
        expect(result.unifiedItem.reference.id).toBe(1)
      }
      expect(result.operation).toBe('addUnifiedItem')
      expect(result.templateType).toBe('Item')
    })

    it('creates unified item from recipe template', () => {
      const recipeItem: RecipeItem = {
        id: 2,
        name: 'Recipe Test',
        reference: {
          id: 2,
          type: 'recipe',
          children: [],
        },
        quantity: 100,
        __type: 'UnifiedItem' as const,
      }

      const result = createUnifiedItemFromTemplate(recipeTemplate, recipeItem)

      expect(result.unifiedItem).toBeDefined()
      expect(result.unifiedItem.name).toBe('Recipe Test')
      expect(result.unifiedItem.reference.type).toBe('recipe')
      expect(result.operation).toBe('addUnifiedRecipeItem')
      expect(result.templateType).toBe('Recipe')
    })

    it('throws error for invalid template/item combination', () => {
      expect(() =>
        createUnifiedItemFromTemplate(foodTemplate, {
          id: 1,
          name: 'Invalid',
          reference: {
            id: 999,
            type: 'recipe',
            children: [],
          },
          quantity: 100,
          __type: 'UnifiedItem' as const,
        }),
      ).toThrow('Template is not a Recipe or item type mismatch')
    })
  })

  describe('templateToUnifiedItem', () => {
    it('converts food template to unified item', () => {
      const result = templateToUnifiedItemDirect(foodTemplate, 150)

      expect(result.name).toBe('Arroz')
      expect(result.quantity).toBe(150)
      expect(result.reference.type).toBe('food')
      if (result.reference.type === 'food') {
        expect(result.reference.id).toBe(1)
      }
      expect(result.__type).toBe('UnifiedItem')
    })

    it('converts recipe template to unified item', () => {
      const result = templateToUnifiedItemDirect(recipeTemplate, 100)

      expect(result.name).toBe('Recipe Test')
      expect(result.quantity).toBe(100)
      expect(result.reference.type).toBe('recipe')
      if (result.reference.type === 'recipe') {
        expect(result.reference.id).toBe(2)
      }
      expect(result.__type).toBe('UnifiedItem')
    })

    it('uses default quantity when not specified', () => {
      const result = templateToUnifiedItemDirect(foodTemplate)
      expect(result.quantity).toBe(100) // DEFAULT_QUANTITY
    })
  })
})
