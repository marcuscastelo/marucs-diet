import { describe, expect, it } from 'vitest'

import type { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'

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
    macros: { protein: 20, carbs: 0, fat: 2 },
    reference: { type: 'food', id: 10 },
  }
  it('itemToUnifiedItem and unifiedItemToItem are inverse', () => {
    const unified = itemToUnifiedItem(sampleItem)
    expect(unified).toMatchObject(unifiedFood)
    const item = unifiedItemToItem(unified)
    expect(item).toMatchObject(sampleItem)
  })
  it('itemGroupToUnifiedItem converts group', () => {
    const groupUnified = itemGroupToUnifiedItem(sampleGroup)
    expect(groupUnified.reference.type).toBe('group')
    if (groupUnified.reference.type === 'group') {
      expect(Array.isArray(groupUnified.reference.children)).toBe(true)
    }
  })
})
