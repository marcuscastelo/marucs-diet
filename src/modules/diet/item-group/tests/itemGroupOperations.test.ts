import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  addItemsToGroup,
  addItemToGroup,
  clearItemGroupItems,
  findItemInGroup,
  updateItemInGroup,
} from '~/modules/diet/item-group/domain/itemGroupOperations'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

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
function makeGroup(id: number, name = 'G1', items = [makeItem(1)]) {
  return {
    ...createSimpleItemGroup({ name, items }),
    id,
  }
}

const baseItem = makeItem(1)
const item2 = makeItem(2, 'Feijão')
const item3 = makeItem(3, 'Batata')
const baseGroup = makeGroup(1, 'G1', [baseItem])

describe('itemGroupOperations', () => {
  it('should maintain group integrity when updating items', () => {
    const group = makeGroup(1, 'Main Group', [baseItem, item2])
    const updatedItem = { ...baseItem, name: 'Updated Rice' }

    const result = updateItemInGroup(group, baseItem.id, updatedItem)

    // Ensure the specific item is updated
    const foundItem = findItemInGroup(result, baseItem.id)
    expect(foundItem?.name).toBe('Updated Rice')

    // Ensure other items remain unchanged
    const otherItem = findItemInGroup(result, item2.id)
    expect(otherItem).toEqual(item2)

    // Ensure group properties are preserved
    expect(result.name).toBe(group.name)
    expect(result.id).toBe(group.id)
  })

  it('should handle non-existent item updates gracefully', () => {
    const nonExistentId = 999
    const fakeItem = makeItem(nonExistentId, 'Fake Item')

    const result = updateItemInGroup(baseGroup, nonExistentId, fakeItem)

    // Should return original group unchanged
    expect(result).toEqual(baseGroup)
    expect(result.items).toHaveLength(1)
  })

  it('should preserve macro calculations when manipulating items', () => {
    const highProteinItem = {
      ...createItem({
        name: 'Chicken',
        reference: 2,
        quantity: 100,
        macros: createMacroNutrients({ protein: 25, carbs: 0, fat: 5 }),
      }),
      id: 2,
    }

    const group = addItemToGroup(baseGroup, highProteinItem)

    // Verify both items are present with correct macros
    expect(group.items).toHaveLength(2)
    expect(findItemInGroup(group, baseItem.id)?.macros.carbs).toBe(10)
    expect(findItemInGroup(group, highProteinItem.id)?.macros.protein).toBe(25)
  })

  it('should handle bulk operations correctly', () => {
    const newItems = [item2, item3]
    const group = addItemsToGroup(baseGroup, newItems)

    expect(group.items).toHaveLength(3)

    // Verify all items are findable
    expect(findItemInGroup(group, baseItem.id)).toBeTruthy()
    expect(findItemInGroup(group, item2.id)).toBeTruthy()
    expect(findItemInGroup(group, item3.id)).toBeTruthy()

    // Test clearing maintains group structure
    const clearedGroup = clearItemGroupItems(group)
    expect(clearedGroup.items).toHaveLength(0)
    expect(clearedGroup.name).toBe(group.name)
    expect(clearedGroup.id).toBe(group.id)
  })
})
