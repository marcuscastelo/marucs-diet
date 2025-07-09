import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createNewMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createNewMeal, promoteMeal } from '~/modules/diet/meal/domain/meal'
import {
  addGroupToMeal,
  addItemsToMeal,
  addItemToMeal,
  clearMealItems,
  removeGroupFromMeal,
  removeItemFromMeal,
  setMealGroups,
  setMealItems,
  updateGroupInMeal,
  updateItemInMeal,
} from '~/modules/diet/meal/domain/mealOperations'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
      name,
      reference: id,
      quantity: 100,
      macros: createNewMacroNutrients({ carbs: 10, protein: 2, fat: 1 }),
    }),
    id,
  }
}

function makeUnifiedItemFromItem(item: ReturnType<typeof makeItem>) {
  return createUnifiedItem({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    reference: {
      type: 'food' as const,
      id: item.reference,
      macros: item.macros,
    },
  })
}

function makeGroup(id: number, name = 'G1', items = [makeItem(1)]) {
  return {
    ...createSimpleItemGroup({ name, items }),
    id,
  }
}

function makeMeal(
  id: number,
  name = 'Almoço',
  items = [makeUnifiedItemFromItem(makeItem(1))],
) {
  return promoteMeal(createNewMeal({ name, items }), id)
}

const baseItem = makeItem(1)
const baseUnifiedItem = makeUnifiedItemFromItem(baseItem)
const baseGroup = makeGroup(1, 'G1', [baseItem])
const baseMeal = makeMeal(1, 'Almoço', [baseUnifiedItem])

describe('mealOperations', () => {
  it('addItemToMeal adds an item', () => {
    const newItem = makeUnifiedItemFromItem(makeItem(2, 'Feijão'))
    const result = addItemToMeal(baseMeal, newItem)
    expect(result.items).toHaveLength(2)
  })

  it('addItemsToMeal adds multiple items', () => {
    const items = [
      makeUnifiedItemFromItem(makeItem(2, 'Feijão')),
      makeUnifiedItemFromItem(makeItem(3, 'Carne')),
    ]
    const result = addItemsToMeal(baseMeal, items)
    expect(result.items).toHaveLength(3)
  })

  it('updateItemInMeal updates an item', () => {
    const updatedItem = createUnifiedItem({
      ...baseUnifiedItem,
      name: 'Arroz Integral',
    })
    const result = updateItemInMeal(baseMeal, 1, updatedItem)
    expect(result.items[0]?.name).toBe('Arroz Integral')
  })

  it('removeItemFromMeal removes an item', () => {
    const result = removeItemFromMeal(baseMeal, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setMealItems sets items', () => {
    const items = [makeUnifiedItemFromItem(makeItem(2, 'Feijão'))]
    const result = setMealItems(baseMeal, items)
    expect(result.items).toEqual(items)
  })

  it('clearMealItems clears items', () => {
    const result = clearMealItems(baseMeal)
    expect(result.items).toEqual([])
  })

  it('addGroupToMeal adds a group (legacy)', () => {
    const group = { ...baseGroup, id: 2 }
    const result = addGroupToMeal(baseMeal, group)
    expect(result.items).toHaveLength(2)
  })

  it('updateGroupInMeal updates a group (legacy)', () => {
    const updated = makeGroup(1, 'Novo', [baseItem])
    const result = updateGroupInMeal(baseMeal, 1, updated)
    expect(result.items).toHaveLength(1)
  })

  it('removeGroupFromMeal removes a group (legacy)', () => {
    const result = removeGroupFromMeal(baseMeal, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setMealGroups sets groups (legacy)', () => {
    const groups = [{ ...baseGroup, id: 2 }]
    const result = setMealGroups(baseMeal, groups)
    expect(result.items).toHaveLength(1)
  })
})
