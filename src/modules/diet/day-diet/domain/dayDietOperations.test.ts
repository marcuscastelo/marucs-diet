import { describe, expect, it } from 'vitest'

import type { DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  addMealsToDayDiet,
  addMealToDayDiet,
  clearDayDietMeals,
  convertToNewDayDiet,
  findMealInDayDiet,
  removeMealFromDayDiet,
  replaceDayDiet,
  setDayDietMeals,
  updateMealInDayDiet,
} from '~/modules/diet/day-diet/domain/dayDietOperations'
import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createMeal } from '~/modules/diet/meal/domain/meal'

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
function makeMeal(id: number, name = 'Almoço', groups = [makeGroup(1)]) {
  return {
    ...createMeal({
      id: 1,
      name,
      groups,
    }),
    id,
  }
}

const baseItem = makeItem(1)
const baseGroup = makeGroup(1, 'G1', [baseItem])
const baseMeal = makeMeal(1, 'Almoço', [baseGroup])
const baseDayDiet: DayDiet = {
  id: 1,
  __type: 'DayDiet',
  owner: 1,
  target_day: '2023-01-01',
  meals: [baseMeal],
}

describe('dayDietOperations', () => {
  it('addMealToDayDiet adds a meal', () => {
    const meal = { ...baseMeal, id: 2 }
    const result = addMealToDayDiet(baseDayDiet, meal)
    expect(result.meals).toHaveLength(2)
    expect(result.meals[1]).toEqual(meal)
  })

  it('addMealsToDayDiet adds multiple meals', () => {
    const meals = [
      { ...baseMeal, id: 2 },
      { ...baseMeal, id: 3 },
    ]
    const result = addMealsToDayDiet(baseDayDiet, meals)
    expect(result.meals).toHaveLength(3)
  })

  it('updateMealInDayDiet updates a meal', () => {
    const updated = makeMeal(1, 'Jantar', [baseGroup])
    const result = updateMealInDayDiet(baseDayDiet, 1, updated)
    expect(result.meals[0]?.name).toBe('Jantar')
  })

  it('removeMealFromDayDiet removes a meal', () => {
    const result = removeMealFromDayDiet(baseDayDiet, 1)
    expect(result.meals).toHaveLength(0)
  })

  it('setDayDietMeals sets meals', () => {
    const meals = [{ ...baseMeal, id: 2 }]
    const result = setDayDietMeals(baseDayDiet, meals)
    expect(result.meals).toEqual(meals)
  })

  it('clearDayDietMeals clears meals', () => {
    const result = clearDayDietMeals(baseDayDiet)
    expect(result.meals).toEqual([])
  })

  it('findMealInDayDiet finds a meal', () => {
    const found = findMealInDayDiet(baseDayDiet, 1)
    expect(found).toEqual(baseMeal)
  })

  it('replaceDayDiet replaces fields', () => {
    const result = replaceDayDiet(baseDayDiet, { owner: 2 })
    expect(result.owner).toBe(2)
  })

  it('convertToNewDayDiet returns NewDayDiet', () => {
    const result = convertToNewDayDiet(baseDayDiet)
    expect(result.__type).toBe('NewDayDiet')
    // @ts-expect-error id should not exist
    expect(result.id).toBeUndefined()
  })
})
