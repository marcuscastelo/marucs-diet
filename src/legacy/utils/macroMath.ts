import { Day } from '@/modules/day/domain/day'
import { ItemGroup } from '@/modules/item-group/domain/itemGroup'
import { MacroNutrients } from '@/modules/macro-nutrients/domain/macroNutrients'
import { Meal } from '@/modules/meal/domain/meal'
import { Recipe } from '@/modules/recipe/domain/recipe'
import { TemplateItem } from '@/modules/template-item/domain/templateItem'

export function calcItemMacros(item: TemplateItem): MacroNutrients {
  return {
    carbs: (item.macros.carbs * item.quantity) / 100,
    fat: (item.macros.fat * item.quantity) / 100,
    protein: (item.macros.protein * item.quantity) / 100,
  }
}

export function calcRecipeMacros(recipe: Recipe): MacroNutrients {
  return recipe.items.reduce(
    (acc, item) => {
      const itemMacros = calcItemMacros(item)
      return {
        carbs: acc.carbs + itemMacros.carbs,
        fat: acc.fat + itemMacros.fat,
        protein: acc.protein + itemMacros.protein,
      }
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
}

export function calcGroupMacros(group: ItemGroup): MacroNutrients {
  return group.items.reduce(
    (acc, item) => {
      const itemMacros = calcItemMacros(item)
      return {
        carbs: acc.carbs + itemMacros.carbs,
        fat: acc.fat + itemMacros.fat,
        protein: acc.protein + itemMacros.protein,
      }
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
}

export function calcMealMacros(meal: Meal): MacroNutrients {
  return meal.groups.reduce(
    (acc, group) => {
      const groupMacros = calcGroupMacros(group)
      return {
        carbs: acc.carbs + groupMacros.carbs,
        fat: acc.fat + groupMacros.fat,
        protein: acc.protein + groupMacros.protein,
      }
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
}

export function calcDayMacros(day: Day): MacroNutrients {
  return day.meals.reduce(
    (acc, meal) => {
      const mealMacros = calcMealMacros(meal)
      return {
        carbs: acc.carbs + mealMacros.carbs,
        fat: acc.fat + mealMacros.fat,
        protein: acc.protein + mealMacros.protein,
      }
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
}

export function calcCalories(macroNutrients: MacroNutrients): number {
  return (
    macroNutrients.carbs * 4 +
    macroNutrients.fat * 9 +
    macroNutrients.protein * 4
  )
}

export const calcItemCalories = (item: TemplateItem) =>
  calcCalories(calcItemMacros(item))

export const calcRecipeCalories = (recipe: Recipe) =>
  calcCalories(calcRecipeMacros(recipe))

export const calcGroupCalories = (group: ItemGroup) =>
  calcCalories(calcGroupMacros(group))

export const calcMealCalories = (meal: Meal) =>
  calcCalories(calcMealMacros(meal))

export const calcDayCalories = (day: Day) => calcCalories(calcDayMacros(day))
