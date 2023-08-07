import { Day } from '@/model/dayModel'
import { FoodItemGroup } from '@/model/foodItemGroupModel'
import { FoodItem } from '@/model/foodItemModel'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import { MealData } from '@/model/mealModel'
import { Recipe } from '@/model/recipeModel'

export function calcItemMacros(item: FoodItem): MacroNutrientsData {
  return {
    carbs: (item.macros.carbs * item.quantity) / 100,
    fat: (item.macros.fat * item.quantity) / 100,
    protein: (item.macros.protein * item.quantity) / 100,
  }
}

export function calcRecipeMacros(recipe: Recipe): MacroNutrientsData {
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

export function calcGroupMacros(group: FoodItemGroup): MacroNutrientsData {
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

export function calcMealMacros(meal: MealData): MacroNutrientsData {
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

export function calcDayMacros(day: Day): MacroNutrientsData {
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

export function calcCalories(macroNutrients: MacroNutrientsData): number {
  return (
    macroNutrients.carbs * 4 +
    macroNutrients.fat * 9 +
    macroNutrients.protein * 4
  )
}

export const calcItemCalories = (item: FoodItem) =>
  calcCalories(calcItemMacros(item))

export const calcRecipeCalories = (recipe: Recipe) =>
  calcCalories(calcRecipeMacros(recipe))

export const calcGroupCalories = (group: FoodItemGroup) =>
  calcCalories(calcGroupMacros(group))

export const calcMealCalories = (meal: MealData) =>
  calcCalories(calcMealMacros(meal))

export const calcDayCalories = (day: Day) => calcCalories(calcDayMacros(day))