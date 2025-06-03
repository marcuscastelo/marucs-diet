import {
  updateRecipeName,
  updateRecipePreparedMultiplier,
  addItemToRecipe,
  addItemsToRecipe,
  updateItemInRecipe,
  removeItemFromRecipe,
  setRecipeItems,
  clearRecipeItems,
  findItemInRecipe,
  replaceRecipe,
} from './recipeOperations'
import { describe, it, expect } from 'vitest'

const baseItem = {
  id: 1,
  __type: 'Item',
  name: 'Arroz',
  reference: 1,
  quantity: 100,
  macros: { carbs: 10, protein: 2, fat: 1 },
} as const
const baseRecipe = {
  id: 1,
  __type: 'Recipe',
  name: 'Receita',
  owner: 1,
  items: [baseItem],
  prepared_multiplier: 1,
} as any

describe('recipeOperations', () => {
  it('updateRecipeName updates name', () => {
    const result = updateRecipeName(baseRecipe, 'Novo')
    expect(result.name).toBe('Novo')
  })

  it('updateRecipePreparedMultiplier updates multiplier', () => {
    const result = updateRecipePreparedMultiplier(baseRecipe, 2)
    expect(result.prepared_multiplier).toBe(2)
  })

  it('addItemToRecipe adds item', () => {
    const item = { ...baseItem, id: 2 }
    const result = addItemToRecipe(baseRecipe, item)
    expect(result.items).toHaveLength(2)
  })

  it('addItemsToRecipe adds items', () => {
    const items = [
      { ...baseItem, id: 2 },
      { ...baseItem, id: 3 },
    ]
    const result = addItemsToRecipe(baseRecipe, items)
    expect(result.items).toHaveLength(3)
  })

  it('updateItemInRecipe updates item', () => {
    const updated = { ...baseItem, name: 'Feijão' }
    const result = updateItemInRecipe(baseRecipe, 1, updated)
    expect(result.items[0].name).toBe('Feijão')
  })

  it('removeItemFromRecipe removes item', () => {
    const result = removeItemFromRecipe(baseRecipe, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setRecipeItems sets items', () => {
    const items = [{ ...baseItem, id: 2 }]
    const result = setRecipeItems(baseRecipe, items)
    expect(result.items).toEqual(items)
  })

  it('clearRecipeItems clears items', () => {
    const result = clearRecipeItems(baseRecipe)
    expect(result.items).toEqual([])
  })

  it('findItemInRecipe finds item', () => {
    const found = findItemInRecipe(baseRecipe, 1)
    expect(found).toEqual(baseItem)
  })

  it('replaceRecipe replaces fields', () => {
    const result = replaceRecipe(baseRecipe, { name: 'Novo' })
    expect(result.name).toBe('Novo')
  })
})
