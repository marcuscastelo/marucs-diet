import { describe, expect, it } from 'vitest'

import { createItem, type Item } from '~/modules/diet/item/domain/item'
import {
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import type { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('conversionUtils', () => {
  const sampleItem: Item = {
    ...createItem({
      name: 'Chicken',
      reference: 10,
      quantity: 100,
      macros: createMacroNutrients({ protein: 20, carbs: 0, fat: 2 }),
    }),
    id: 1,
  }
  const sampleGroup: ItemGroup = {
    ...createSimpleItemGroup({
      name: 'Lunch',
      items: [sampleItem],
    }),
    id: 2,
    recipe: 1,
  } as ItemGroup
  const unifiedFood = {
    id: 1,
    name: 'Chicken',
    quantity: 100,
    reference: {
      type: 'food',
      id: 10,
      macros: createMacroNutrients({ protein: 20, carbs: 0, fat: 2 }),
    },
  }
  it('itemToUnifiedItem and unifiedItemToItem are inverse', () => {
    const unified = itemToUnifiedItem(sampleItem)
    expect(unified).toMatchObject(unifiedFood)
    const item = unifiedItemToItem(unified)
    expect(item).toMatchObject(sampleItem)
  })
  it('itemGroupToUnifiedItem converts group to recipe when recipe field exists', () => {
    const groupUnified = itemGroupToUnifiedItem(sampleGroup)
    expect(groupUnified.reference.type).toBe('recipe')
    if (groupUnified.reference.type === 'recipe') {
      expect(groupUnified.reference.id).toBe(1)
      expect(Array.isArray(groupUnified.reference.children)).toBe(true)
    }
  })

  it('itemGroupToUnifiedItem converts group to group when no recipe field', () => {
    const plainGroup: ItemGroup = {
      ...createSimpleItemGroup({
        name: 'Simple Group',
        items: [sampleItem],
      }),
      id: 3,
    }
    const groupUnified = itemGroupToUnifiedItem(plainGroup)
    expect(groupUnified.reference.type).toBe('group')
    if (groupUnified.reference.type === 'group') {
      expect(Array.isArray(groupUnified.reference.children)).toBe(true)
    }
  })

  it('unifiedItemToItem preserves macros per 100g for different quantities', () => {
    // Test with 200g quantity to ensure macros remain per 100g (not calculated for quantity)
    const unifiedItemWith200g: UnifiedItem = createUnifiedItem({
      id: 1,
      name: 'Chicken',
      quantity: 200, // 200g instead of 100g
      reference: {
        type: 'food',
        id: 10,
        macros: createMacroNutrients({ protein: 20, carbs: 0, fat: 2 }),
      }, // Per 100g
    })

    const item = unifiedItemToItem(unifiedItemWith200g)

    // Macros should remain per 100g (not calculated for the specific quantity)
    expect(item.macros).toEqual(
      createMacroNutrients({
        protein: 20, // Still per 100g
        carbs: 0, // Still per 100g
        fat: 2, // Still per 100g
      }),
    )
    expect(item.quantity).toBe(200)
  })
})
