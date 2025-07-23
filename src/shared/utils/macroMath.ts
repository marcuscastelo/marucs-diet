import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export function calcItemContainerMacros<
  T extends { items: readonly UnifiedItem[] },
>(container: T): MacroNutrients {
  const result = container.items.reduce(
    (acc, item) => {
      const itemMacros = calcUnifiedItemMacros(item)
      acc.carbs += itemMacros.carbs
      acc.fat += itemMacros.fat
      acc.protein += itemMacros.protein
      return acc
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
  return createMacroNutrients(result)
}

export function calcRecipeMacros(recipe: Recipe): MacroNutrients {
  return calcItemContainerMacros({
    items: recipe.items,
  })
}

export function calcUnifiedRecipeMacros(recipe: Recipe): MacroNutrients {
  return calcItemContainerMacros(recipe)
}

/**
 * Calculates macros for a UnifiedItem, handling all reference types
 */
export function calcUnifiedItemMacros(item: UnifiedItem): MacroNutrients {
  if (isFoodItem(item)) {
    // For food items, calculate proportionally from stored macros in reference
    return createMacroNutrients({
      carbs: (item.reference.macros.carbs * item.quantity) / 100,
      fat: (item.reference.macros.fat * item.quantity) / 100,
      protein: (item.reference.macros.protein * item.quantity) / 100,
    })
  } else if (isRecipeItem(item) || isGroupItem(item)) {
    // For recipe and group items, sum the macros from children
    // The quantity field represents the total prepared amount, not a scaling factor
    const defaultQuantity = item.reference.children.reduce(
      (acc, child) => acc + child.quantity,
      0,
    )
    const defaultMacros = item.reference.children.reduce(
      (acc, child) => {
        const childMacros = calcUnifiedItemMacros(child)
        return createMacroNutrients({
          carbs: acc.carbs + childMacros.carbs,
          fat: acc.fat + childMacros.fat,
          protein: acc.protein + childMacros.protein,
        })
      },
      createMacroNutrients({ carbs: 0, fat: 0, protein: 0 }),
    )

    return createMacroNutrients({
      carbs: (item.quantity / defaultQuantity) * defaultMacros.carbs,
      fat: (item.quantity / defaultQuantity) * defaultMacros.fat,
      protein: (item.quantity / defaultQuantity) * defaultMacros.protein,
    })
  }

  // Fallback for unknown types
  item satisfies never
  return createMacroNutrients({ carbs: 0, fat: 0, protein: 0 })
}

export function calcMealMacros(meal: Meal): MacroNutrients {
  const result = meal.items.reduce(
    (acc, item) => {
      const itemMacros = calcUnifiedItemMacros(item)
      acc.carbs += itemMacros.carbs
      acc.fat += itemMacros.fat
      acc.protein += itemMacros.protein
      return acc
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
  return createMacroNutrients(result)
}

export function calcDayMacros(day: DayDiet): MacroNutrients {
  const result = day.meals.reduce(
    (acc, meal) => {
      const mealMacros = calcMealMacros(meal)
      acc.carbs += mealMacros.carbs
      acc.fat += mealMacros.fat
      acc.protein += mealMacros.protein
      return acc
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
  return createMacroNutrients(result)
}

export function calcCalories(macroNutrients: MacroNutrients): number {
  return (
    macroNutrients.carbs * 4 +
    macroNutrients.protein * 4 +
    macroNutrients.fat * 9
  )
}

export const calcRecipeCalories = (recipe: Recipe) =>
  calcCalories(calcRecipeMacros(recipe))

export const calcUnifiedRecipeCalories = (recipe: Recipe) =>
  calcCalories(calcUnifiedRecipeMacros(recipe))

export const calcUnifiedItemCalories = (item: UnifiedItem) =>
  calcCalories(calcUnifiedItemMacros(item))

export const calcMealCalories = (meal: Meal) =>
  calcCalories(calcMealMacros(meal))

export const calcDayCalories = (day: DayDiet) =>
  calcCalories(calcDayMacros(day))
