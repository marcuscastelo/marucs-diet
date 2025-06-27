import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateItem,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { itemToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export function calcItemContainerMacros<
  T extends { items: readonly TemplateItem[] },
>(container: T): MacroNutrients {
  return container.items.reduce(
    (acc, item) => {
      const itemMacros = calcUnifiedItemMacros(item)
      return {
        carbs: acc.carbs + itemMacros.carbs,
        fat: acc.fat + itemMacros.fat,
        protein: acc.protein + itemMacros.protein,
      }
    },
    { carbs: 0, fat: 0, protein: 0 } satisfies MacroNutrients,
  )
}

export function calcRecipeMacros(recipe: Recipe): MacroNutrients {
  return calcItemContainerMacros({
    items: recipe.items
      .map((item) => itemToUnifiedItem(item))
      .filter((item) => isTemplateItem(item)),
  })
}

/**
 * Calculates macros for a UnifiedItem, handling all reference types
 */
export function calcUnifiedItemMacros(item: UnifiedItem): MacroNutrients {
  if (isFoodItem(item)) {
    // For food items, calculate proportionally from stored macros in reference
    return {
      carbs: (item.reference.macros.carbs * item.quantity) / 100,
      fat: (item.reference.macros.fat * item.quantity) / 100,
      protein: (item.reference.macros.protein * item.quantity) / 100,
    }
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
        return {
          carbs: acc.carbs + childMacros.carbs,
          fat: acc.fat + childMacros.fat,
          protein: acc.protein + childMacros.protein,
        }
      },
      { carbs: 0, fat: 0, protein: 0 },
    )

    return {
      carbs: (item.quantity / defaultQuantity) * defaultMacros.carbs,
      fat: (item.quantity / defaultQuantity) * defaultMacros.fat,
      protein: (item.quantity / defaultQuantity) * defaultMacros.protein,
    }
  }

  // Fallback for unknown types
  item satisfies never
  return { carbs: 0, fat: 0, protein: 0 }
}

export function calcMealMacros(meal: Meal): MacroNutrients {
  return meal.items.reduce(
    (acc, item) => {
      const itemMacros = calcUnifiedItemMacros(item)
      return {
        carbs: acc.carbs + itemMacros.carbs,
        fat: acc.fat + itemMacros.fat,
        protein: acc.protein + itemMacros.protein,
      }
    },
    { carbs: 0, fat: 0, protein: 0 },
  )
}

export function calcDayMacros(day: DayDiet): MacroNutrients {
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
    macroNutrients.protein * 4 +
    macroNutrients.fat * 9
  )
}

export const calcRecipeCalories = (recipe: Recipe) =>
  calcCalories(calcRecipeMacros(recipe))

export const calcUnifiedItemCalories = (item: UnifiedItem) =>
  calcCalories(calcUnifiedItemMacros(item))

export const calcMealCalories = (meal: Meal) =>
  calcCalories(calcMealMacros(meal))

export const calcDayCalories = (day: DayDiet) =>
  calcCalories(calcDayMacros(day))
