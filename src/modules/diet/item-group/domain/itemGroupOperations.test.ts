import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  addItemsToGroup,
  addItemToGroup,
  clearItemGroupItems,
  findItemInGroup,
  removeItemFromGroup,
  replaceItemGroup,
  setItemGroupItems,
  setItemGroupRecipe,
  updateItemGroupName,
  updateItemInGroup,
} from '~/modules/diet/item-group/domain/itemGroupOperations'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
      id: 1,
      name,
      reference: id,
      quantity: 100,
      macros: { carbs: 10, protein: 2, fat: 1 },
    }),
    id,
  }
}
function makeGroup(id: number, name = 'G1', items = [makeItem(1)]) {
  return {
    ...createSimpleItemGroup({
      id: 1,
      name,
      items,
    }),
    id,
  }
}

const baseItem = makeItem(1)
const item2 = makeItem(2, 'Feijão')
const item3 = makeItem(3, 'Batata')
const baseGroup = makeGroup(1, 'G1', [baseItem])

describe('itemGroupOperations', () => {
  it('updateItemGroupName updates name', () => {
    const result = updateItemGroupName(baseGroup, 'Novo')
    expect(result.name).toBe('Novo')
  })

  it('setItemGroupRecipe sets recipe', () => {
    const result = setItemGroupRecipe(baseGroup, 2)
    expect(result.recipe).toBe(2)
  })

  it('addItemToGroup adds item', () => {
    const result = addItemToGroup(baseGroup, item2)
    expect(result.items).toHaveLength(2)
  })

  it('addItemsToGroup adds items', () => {
    const result = addItemsToGroup(baseGroup, [item2, item3])
    expect(result.items).toHaveLength(3)
  })

  it('updateItemInGroup updates item', () => {
    const updated = makeItem(1, 'Feijão')
    const result = updateItemInGroup(baseGroup, 1, updated)
    expect(result.items[0]?.name).toBe('Feijão')
  })

  it('removeItemFromGroup removes item', () => {
    const result = removeItemFromGroup(baseGroup, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setItemGroupItems sets items', () => {
    const result = setItemGroupItems(baseGroup, [item2])
    expect(result.items).toEqual([item2])
  })

  it('clearItemGroupItems clears items', () => {
    const result = clearItemGroupItems(baseGroup)
    expect(result.items).toEqual([])
  })

  it('findItemInGroup finds item', () => {
    const found = findItemInGroup(baseGroup, 1)
    expect(found).toEqual(baseItem)
  })

  it('replaceItemGroup replaces fields', () => {
    const result = replaceItemGroup(baseGroup, { name: 'Novo' })
    expect(result.name).toBe('Novo')
  })
})
