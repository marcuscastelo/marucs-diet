import { describe, expect, it } from 'vitest'

import {
  calcCalories,
  calcDayCalories,
  calcDayMacros,
  calcGroupCalories,
  calcGroupMacros,
  calcItemCalories,
  calcItemContainerMacros,
  calcItemMacros,
  calcMacroDirection,
  calcMealCalories,
  calcMealMacros,
  calcRecipeCalories,
  calcRecipeMacros,
} from '~/legacy/utils/macroMath'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createMeal } from '~/modules/diet/meal/domain/meal'
import {
  createNewRecipe,
  promoteToRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

const baseMacros: MacroNutrients = { carbs: 50, fat: 30, protein: 20 }
const templateItem: TemplateItem = {
  macros: baseMacros,
  quantity: 100,
} as TemplateItem
const templateItem2: TemplateItem = {
  macros: { carbs: 10, fat: 5, protein: 5 },
  quantity: 200,
} as TemplateItem
const baseItem = createItem({
  name: 'Item',
  reference: 1,
  quantity: 100,
  macros: baseMacros,
})
const baseItem2 = createItem({
  name: 'Item2',
  reference: 2,
  quantity: 200,
  macros: { carbs: 10, fat: 5, protein: 5 },
})
const baseGroup = createSimpleItemGroup({
  name: 'Group',
  items: [baseItem, baseItem2],
})
const baseMeal = createMeal({ name: 'Meal', groups: [baseGroup] })
const baseDayDiet: DayDiet = {
  id: 1,
  __type: 'DayDiet',
  owner: 1,
  target_day: '2023-01-01',
  meals: [baseMeal],
}
const recipe = promoteToRecipe(
  createNewRecipe({
    name: 'Test Recipe',
    owner: 1,
    items: [baseItem, baseItem2],
    preparedMultiplier: 1,
  }),
  1,
)

describe('macroMath', () => {
  it('calcMacroDirection normalizes macros', () => {
    expect(calcMacroDirection({ carbs: 2, fat: 3, protein: 5 })).toEqual({
      carbs: 0.2,
      fat: 0.3,
      protein: 0.5,
    })
    expect(calcMacroDirection({ carbs: 0, fat: 0, protein: 0 })).toEqual({
      carbs: 0,
      fat: 0,
      protein: 0,
    })
  })

  it('calcItemMacros calculates macros for a template item', () => {
    expect(calcItemMacros(templateItem)).toEqual(baseMacros)
    expect(
      calcItemMacros({
        macros: { carbs: 10, fat: 5, protein: 5 },
        quantity: 200,
      } as TemplateItem),
    ).toEqual({ carbs: 20, fat: 10, protein: 10 })
  })

  it('calcItemContainerMacros sums macros for a container', () => {
    expect(
      calcItemContainerMacros({ items: [templateItem, templateItem2] }),
    ).toEqual({ carbs: 70, fat: 40, protein: 30 })
  })

  it('calcRecipeMacros delegates to calcItemContainerMacros', () => {
    expect(calcRecipeMacros(recipe)).toEqual({
      carbs: 70,
      fat: 40,
      protein: 30,
    })
  })

  it('calcGroupMacros delegates to calcItemContainerMacros', () => {
    expect(calcGroupMacros(baseGroup)).toEqual({
      carbs: 70,
      fat: 40,
      protein: 30,
    })
  })
  it('calcMealMacros sums macros for all groups in a meal', () => {
    expect(calcMealMacros(baseMeal)).toEqual({
      carbs: 70,
      fat: 40,
      protein: 30,
    })
  })
  it('calcDayMacros sums macros for all meals in a day', () => {
    expect(calcDayMacros(baseDayDiet)).toEqual({
      carbs: 70,
      fat: 40,
      protein: 30,
    })
  })
  it('calcGroupCalories calculates calories for a group', () => {
    expect(calcGroupCalories(baseGroup)).toBe(
      calcCalories({ carbs: 70, fat: 40, protein: 30 }),
    )
  })
  it('calcMealCalories calculates calories for a meal', () => {
    expect(calcMealCalories(baseMeal)).toBe(
      calcCalories({ carbs: 70, fat: 40, protein: 30 }),
    )
  })
  it('calcDayCalories calculates calories for a day', () => {
    expect(calcDayCalories(baseDayDiet)).toBe(
      calcCalories({ carbs: 70, fat: 40, protein: 30 }),
    )
  })
})
