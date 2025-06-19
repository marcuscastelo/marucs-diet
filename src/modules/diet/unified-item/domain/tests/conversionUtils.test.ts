import { describe, expect, it } from 'vitest'

import type { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import type { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('conversionUtils', () => {
  const sampleItem: Item = {
    id: 1,
    name: 'Chicken',
    quantity: 100,
    macros: { protein: 20, carbs: 0, fat: 2 },
    reference: 10,
    __type: 'Item',
  }
  const sampleGroup: ItemGroup = {
    id: 2,
    name: 'Lunch',
    items: [sampleItem],
    recipe: 1,
    __type: 'ItemGroup',
  }
  const unifiedFood = {
    id: 1,
    name: 'Chicken',
    quantity: 100,
    reference: {
      type: 'food',
      id: 10,
      macros: { protein: 20, carbs: 0, fat: 2 },
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
      id: 3,
      name: 'Simple Group',
      items: [sampleItem],
      __type: 'ItemGroup',
    }
    const groupUnified = itemGroupToUnifiedItem(plainGroup)
    expect(groupUnified.reference.type).toBe('group')
    if (groupUnified.reference.type === 'group') {
      expect(Array.isArray(groupUnified.reference.children)).toBe(true)
    }
  })

  it('unifiedItemToItem preserves macros per 100g for different quantities', () => {
    // Test with 200g quantity to ensure macros remain per 100g (not calculated for quantity)
    const unifiedItemWith200g: UnifiedItem = {
      id: 1,
      name: 'Chicken',
      quantity: 200, // 200g instead of 100g
      reference: {
        type: 'food',
        id: 10,
        macros: { protein: 20, carbs: 0, fat: 2 },
      }, // Per 100g
      __type: 'UnifiedItem',
    }

    const item = unifiedItemToItem(unifiedItemWith200g)

    // Macros should remain per 100g (not calculated for the specific quantity)
    expect(item.macros).toEqual({
      protein: 20, // Still per 100g
      carbs: 0, // Still per 100g
      fat: 2, // Still per 100g
    })
    expect(item.quantity).toBe(200)
  })

  it('unifiedItemToItem handles 50g quantity correctly', () => {
    // Test with 50g quantity
    const unifiedItemWith50g: UnifiedItem = {
      id: 1,
      name: 'Chicken',
      quantity: 50, // 50g
      reference: {
        type: 'food',
        id: 10,
        macros: { protein: 20, carbs: 10, fat: 2 },
      }, // Per 100g
      __type: 'UnifiedItem',
    }

    const item = unifiedItemToItem(unifiedItemWith50g)

    // Macros should remain per 100g (not calculated for the specific quantity)
    expect(item.macros).toEqual({
      protein: 20, // Still per 100g
      carbs: 10, // Still per 100g
      fat: 2, // Still per 100g
    })
    expect(item.quantity).toBe(50)
  })
})
