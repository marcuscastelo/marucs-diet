import { describe, expect, it } from 'vitest'

import type { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  migrateFromUnifiedItems,
  migrateToUnifiedItems,
} from '~/modules/diet/unified-item/domain/migrationUtils'

describe('migrationUtils', () => {
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
  it('migrates items and groups to unified and back', () => {
    const unified = migrateToUnifiedItems([sampleItem], [sampleGroup])
    expect(unified.length).toBe(2)
    const { items, groups } = migrateFromUnifiedItems(unified)
    expect(items.length).toBe(1)
    expect(groups.length).toBe(1)
  })
})
