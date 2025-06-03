import {
  updateItemGroupName,
  setItemGroupRecipe,
  addItemToGroup,
  addItemsToGroup,
  updateItemInGroup,
  removeItemFromGroup,
  setItemGroupItems,
  clearItemGroupItems,
  findItemInGroup,
  replaceItemGroup,
} from './itemGroupOperations'
import { describe, it, expect } from 'vitest'

const baseItem = {
  id: 1,
  __type: 'Item',
  name: 'Arroz',
  reference: 1,
  quantity: 100,
  macros: { carbs: 10, protein: 2, fat: 1 },
} as const
const item2 = { ...baseItem, id: 2 } as const
const item3 = { ...baseItem, id: 3 } as const
const baseGroup = {
  id: 1,
  type: 'simple',
  __type: 'ItemGroup',
  name: 'G1',
  items: [baseItem],
} as any

describe('itemGroupOperations', () => {
  it('updateItemGroupName updates name', () => {
    const result = updateItemGroupName(baseGroup, 'Novo')
    expect(result.name).toBe('Novo')
  })

  it('setItemGroupRecipe sets recipe', () => {
    const result = setItemGroupRecipe(baseGroup, 2)
    expect(result.type).toBe('recipe')
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
    const updated = { ...baseItem, name: 'Feijão' }
    const result = updateItemInGroup(baseGroup, 1, updated)
    expect(result.items[0].name).toBe('Feijão')
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
