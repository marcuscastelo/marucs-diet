import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { calcItemMacros, calcDayMacros } from '~/legacy/utils/macroMath'

export interface MacroOverflowOptions {
  enable: boolean
  originalItem?: TemplateItem
}

export interface MacroOverflowContext {
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
  context: MacroOverflowContext
): boolean {
  const { currentDayDiet, macroTarget, macroOverflowOptions } = context

  // Check if overflow detection is enabled
  if (!macroOverflowOptions.enable) {
    return false
  }

  // Validate required context
  if (currentDayDiet === null) {
    console.error(
      '[macroOverflow] currentDayDiet is undefined, cannot calculate overflow'
    )
    return false
  }

  if (macroTarget === null) {
    console.error(
      '[macroOverflow] macroTarget is undefined, cannot calculate overflow'
    )
    return false
  }

  // Calculate macros for the item being checked
  const itemMacros = calcItemMacros(item)
  
  // Calculate original item macros if provided (for edit scenarios)
  const originalItemMacros: MacroNutrients = macroOverflowOptions.originalItem !== undefined
    ? calcItemMacros(macroOverflowOptions.originalItem)
    : { carbs: 0, protein: 0, fat: 0 }

  // Calculate the difference (for edits) or full amount (for new items)
  const difference = macroOverflowOptions.originalItem !== undefined
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
  context: MacroOverflowContext
) {
  return {
    carbs: () => isOverflow(item, 'carbs', context),
    protein: () => isOverflow(item, 'protein', context),
    fat: () => isOverflow(item, 'fat', context),
  }
}

/**
 * Specialized version for ItemGroup scenarios where we check the first item.
 * This handles the specific case from TemplateSearchModal.
 * 
 * @param items - Array of template items (uses first item for calculation)
 * @param property - The macro nutrient property to check
 * @param context - Context containing current day diet, macro target, and overflow options
 * @returns true if the macro would exceed the target, false otherwise
 */
export function isOverflowForItemGroup(
  items: readonly TemplateItem[],
  property: keyof MacroNutrients,
  context: MacroOverflowContext
): boolean {
  if (items.length === 0) {
    console.warn('[macroOverflow] No items provided for overflow check')
    return false
  }

  // Use the first item for calculation (as done in TemplateSearchModal)
  return isOverflow(items[0], property, context)
}
