import {
  updateMealName,
  addGroupToMeal,
  addGroupsToMeal,
  updateGroupInMeal,
  removeGroupFromMeal,
  setMealGroups,
  clearMealGroups,
  findGroupInMeal,
  replaceMeal,
} from './mealOperations'
import { describe, it, expect } from 'vitest'

const baseItem = {
  id: 1,
  __type: 'Item',
  name: 'Arroz',
  reference: 1,
  quantity: 100,
  macros: { carbs: 10, protein: 2, fat: 1 },
}
const baseGroup = {
  id: 1,
  type: 'simple',
  __type: 'ItemGroup',
  name: 'G1',
  items: [baseItem],
} as any // as any to allow mutable array
const baseMeal = {
  id: 1,
  __type: 'Meal',
  name: 'Almoço',
  groups: [baseGroup],
} as any // as any to allow mutable array

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
    const updated = { ...baseGroup, name: 'Novo' }
    const result = updateGroupInMeal(baseMeal, 1, updated)
    expect(result.groups[0].name).toBe('Novo')
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
