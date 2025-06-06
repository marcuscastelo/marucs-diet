import { calcDayMacros, calcItemMacros } from '~/legacy/utils/macroMath'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { handleValidationError, logError } from '~/shared/error/errorHandler'

export type MacroOverflowOptions = {
  enable: boolean
  originalItem?: TemplateItem
}

export type MacroOverflowContext = {
  currentDayDiet: DayDiet | null
  macroTarget: MacroNutrients | null
  macroOverflowOptions: MacroOverflowOptions
}

/**
 * Checks if adding/editing an item would cause a macro nutrient to exceed the target.
 * This function handles different scenarios:
 * - Adding new items (no originalItem)
 * - Editing existing items (with originalItem for difference calculation)
 * - Disabled overflow checking
 *
 * @param item - The item being added or edited
 * @param property - The macro nutrient property to check ('carbs', 'protein', 'fat')
 * @param context - Context containing current day diet, macro target, and overflow options
 * @returns true if the macro would exceed the target, false otherwise
 */
export function isOverflow(
  item: TemplateItem,
  property: keyof MacroNutrients,
  context: MacroOverflowContext,
): boolean {
  const { currentDayDiet, macroTarget, macroOverflowOptions } = context

  // Check if overflow detection is enabled
  if (!macroOverflowOptions.enable) {
    return false
  }

  // Validate required context
  if (currentDayDiet === null) {
    handleValidationError(
      'currentDayDiet is undefined, cannot calculate overflow',
      {
        component: 'macroOverflow',
        operation: 'isOverflow',
        additionalData: { property, itemName: item.name },
      },
    )
    return false
  }

  if (macroTarget === null) {
    handleValidationError(
      'macroTarget is undefined, cannot calculate overflow',
      {
        component: 'macroOverflow',
        operation: 'isOverflow',
        additionalData: { property, itemName: item.name },
      },
    )
    return false
  }

  // Calculate macros for the item being checked
  const itemMacros = calcItemMacros(item)

  const originalItemMacros: MacroNutrients =
    macroOverflowOptions.originalItem !== undefined
      ? calcItemMacros(macroOverflowOptions.originalItem)
      : { carbs: 0, protein: 0, fat: 0 }

  const difference =
    macroOverflowOptions.originalItem !== undefined
      ? itemMacros[property] - originalItemMacros[property]
      : itemMacros[property]

  // Get current day totals and target
  const current = calcDayMacros(currentDayDiet)[property]
  const target = macroTarget[property]

  // Check if adding this difference would exceed the target
  return current + difference > target
}

/**
 * Creates a function that checks overflow for all macro nutrients.
 * Useful for components that need to check multiple macros.
 *
 * @param item - The item being checked
 * @param context - Context containing current day diet, macro target, and overflow options
 * @returns Object with functions to check each macro nutrient
 */
export function createMacroOverflowChecker(
  item: TemplateItem,
  context: MacroOverflowContext,
) {
  return {
    carbs: () => isOverflow(item, 'carbs', context),
    protein: () => isOverflow(item, 'protein', context),
    fat: () => isOverflow(item, 'fat', context),
  }
}

/**
 * Checks if adding a group of items would cause a macro nutrient to exceed the target.
 * Sums the macros of all items in the group and checks overflow for the total.
 *
 * @param items - Array of template items (all items are summed for calculation)
 * @param property - The macro nutrient property to check
 * @param context - Context containing current day diet, macro target, and overflow options
 * @returns true if the macro would exceed the target, false otherwise
 */
export function isOverflowForItemGroup(
  items: readonly TemplateItem[],
  property: keyof MacroNutrients,
  context: MacroOverflowContext,
): boolean {
  if (items.length === 0) {
    logError('No items provided for overflow check', {
      component: 'macroOverflow',
      operation: 'isOverflowForItemGroup',
      additionalData: { property },
    })
    return false
  }

  const { currentDayDiet, macroTarget, macroOverflowOptions } = context

  if (!macroOverflowOptions.enable) {
    return false
  }

  if (currentDayDiet === null) {
    handleValidationError(
      'currentDayDiet is undefined, cannot calculate overflow',
      {
        component: 'macroOverflow',
        operation: 'isOverflowForItemGroup',
        additionalData: { property },
      },
    )
    return false
  }

  if (macroTarget === null) {
    handleValidationError(
      'macroTarget is undefined, cannot calculate overflow',
      {
        component: 'macroOverflow',
        operation: 'isOverflowForItemGroup',
        additionalData: { property },
      },
    )
    return false
  }

  // Sum macros for all items in the group
  const totalMacros = items.reduce<MacroNutrients>(
    (acc, item) => {
      const macros = calcItemMacros(item)
      return {
        carbs: acc.carbs + macros.carbs,
        protein: acc.protein + macros.protein,
        fat: acc.fat + macros.fat,
      }
    },
    { carbs: 0, protein: 0, fat: 0 },
  )

  // Precompute flag and macros for originalItem
  const hasOriginalItem = macroOverflowOptions.originalItem !== undefined
  const originalItemMacros: MacroNutrients = hasOriginalItem
    ? calcItemMacros(macroOverflowOptions.originalItem!)
    : { carbs: 0, protein: 0, fat: 0 }

  const difference = hasOriginalItem
    ? totalMacros[property] - originalItemMacros[property]
    : totalMacros[property]

  const current = calcDayMacros(currentDayDiet)[property]
  const target = macroTarget[property]

  return current + difference > target
}
