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
import { createMeal } from '~/modules/diet/meal/domain/meal'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

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

function makeMeal(
  id: number,
  name = 'Almoço',
  items = [makeUnifiedItemFromItem(makeItem(1))],
) {
  return {
    ...createMeal({ name, items }),
    id,
  }
}

const baseItem = makeItem(1)
const baseMeal = makeMeal(1, 'Almoço', [makeUnifiedItemFromItem(baseItem)])
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
    const updated = makeMeal(1, 'Jantar', [makeUnifiedItemFromItem(baseItem)])
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
