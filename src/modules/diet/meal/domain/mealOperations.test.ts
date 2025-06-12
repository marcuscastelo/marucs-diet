import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createMeal } from '~/modules/diet/meal/domain/meal'
import {
  addGroupsToMeal,
  addGroupToMeal,
  clearMealGroups,
  findGroupInMeal,
  removeGroupFromMeal,
  replaceMeal,
  setMealGroups,
  updateGroupInMeal,
  updateMealName,
} from '~/modules/diet/meal/domain/mealOperations'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
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
    ...createSimpleItemGroup({ name, items }),
    id,
  }
}
function makeMeal(id: number, name = 'Almoço', groups = [makeGroup(1)]) {
  return {
    ...createMeal({ name, groups }),
    id,
  }
}

const baseItem = makeItem(1)
const baseGroup = makeGroup(1, 'G1', [baseItem])
const baseMeal = makeMeal(1, 'Almoço', [baseGroup])

describe('mealOperations', () => {
  it('updateMealName updates name', () => {
    const result = updateMealName(baseMeal, 'Jantar')
    expect(result.name).toBe('Jantar')
  })

  it('addGroupToMeal adds a group', () => {
    const group = { ...baseGroup, id: 2 }
    const result = addGroupToMeal(baseMeal, group)
    expect(result.groups).toHaveLength(2)
  })

  it('addGroupsToMeal adds multiple groups', () => {
    const groups = [
      { ...baseGroup, id: 2 },
      { ...baseGroup, id: 3 },
    ]
    const result = addGroupsToMeal(baseMeal, groups)
    expect(result.groups).toHaveLength(3)
  })

  it('updateGroupInMeal updates a group', () => {
    const updated = makeGroup(1, 'Novo', [baseItem])
    const result = updateGroupInMeal(baseMeal, 1, updated)
    expect(result.groups[0]?.name).toBe('Novo')
  })

  it('removeGroupFromMeal removes a group', () => {
    const result = removeGroupFromMeal(baseMeal, 1)
    expect(result.groups).toHaveLength(0)
  })

  it('setMealGroups sets groups', () => {
    const groups = [{ ...baseGroup, id: 2 }]
    const result = setMealGroups(baseMeal, groups)
    expect(result.groups).toEqual(groups)
  })

  it('clearMealGroups clears groups', () => {
    const result = clearMealGroups(baseMeal)
    expect(result.groups).toEqual([])
  })

  it('findGroupInMeal finds a group', () => {
    const found = findGroupInMeal(baseMeal, 1)
    expect(found).toEqual(baseGroup)
  })

  it('replaceMeal replaces fields', () => {
    const result = replaceMeal(baseMeal, { name: 'Novo' })
    expect(result.name).toBe('Novo')
  })
})
