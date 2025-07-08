import { describe, expect, it } from 'vitest'

import { createItem, type Item } from '~/modules/diet/item/domain/item'
import {
  createRecipedItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { createNewMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  migrateFromUnifiedItems,
  migrateToUnifiedItems,
} from '~/modules/diet/unified-item/domain/migrationUtils'

describe('migrationUtils', () => {
  const sampleItem: Item = {
    ...createItem({
      name: 'Chicken',
      reference: 10,
      quantity: 100,
      macros: createNewMacroNutrients({ protein: 20, carbs: 0, fat: 2 }),
    }),
    id: 1,
  }
  const sampleGroup: ItemGroup = {
    ...createRecipedItemGroup({
      name: 'Lunch',
      items: [sampleItem],
      recipe: 1,
    }),
    id: 2,
  }
  it('migrates items and groups to unified and back', () => {
    const unified = migrateToUnifiedItems([sampleItem], [sampleGroup])
    expect(unified.length).toBe(2)
    const { items, groups } = migrateFromUnifiedItems(unified)
    expect(items.length).toBe(1)
    expect(groups.length).toBe(1)
  })
})
