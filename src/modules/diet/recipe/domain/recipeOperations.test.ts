import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import {
  createNewRecipe,
  promoteToRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import {
  addItemsToRecipe,
  addItemToRecipe,
  clearRecipeItems,
  findItemInRecipe,
  removeItemFromRecipe,
  replaceRecipe,
  setRecipeItems,
  updateItemInRecipe,
  updateRecipeName,
  updateRecipePreparedMultiplier,
} from '~/modules/diet/recipe/domain/recipeOperations'

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
const baseItem = makeItem(1)
const baseRecipe = promoteToRecipe(
  createNewRecipe({
    name: 'Receita',
    owner: 1,
    items: [baseItem],
    preparedMultiplier: 1,
  }),
  1,
)

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
    const item = makeItem(2)
    const result = addItemToRecipe(baseRecipe, item)
    expect(result.items).toHaveLength(2)
  })

  it('addItemsToRecipe adds items', () => {
    const items = [makeItem(2), makeItem(3)]
    const result = addItemsToRecipe(baseRecipe, items)
    expect(result.items).toHaveLength(3)
  })

  it('updateItemInRecipe updates item', () => {
    const updated = makeItem(1, 'Feijão')
    const result = updateItemInRecipe(baseRecipe, 1, updated)
    expect(result.items[0]?.name).toBe('Feijão')
  })

  it('removeItemFromRecipe removes item', () => {
    const result = removeItemFromRecipe(baseRecipe, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setRecipeItems sets items', () => {
    const items = [makeItem(2)]
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

  it('addItemToRecipe works for complex recipes (prepared_multiplier !== 1)', () => {
    const complexRecipe = promoteToRecipe(
      createNewRecipe({
        name: 'Complexa',
        owner: 1,
        items: [baseItem],
        preparedMultiplier: 2,
      }),
      2,
    )
    const item = makeItem(99, 'Novo')
    const result = addItemToRecipe(complexRecipe, item)
    expect(result.items).toHaveLength(2)
    expect(result.prepared_multiplier).toBe(2)
  })

  it('addItemsToRecipe works for complex recipes (prepared_multiplier !== 1)', () => {
    const complexRecipe = promoteToRecipe(
      createNewRecipe({
        name: 'Complexa',
        owner: 1,
        items: [baseItem],
        preparedMultiplier: 3,
      }),
      3,
    )
    const items = [makeItem(100, 'A'), makeItem(101, 'B')]
    const result = addItemsToRecipe(complexRecipe, items)
    expect(result.items).toHaveLength(3)
    expect(result.prepared_multiplier).toBe(3)
  })
})
