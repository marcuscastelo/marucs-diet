import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  createMacroNutrients,
  type MacroNutrients,
  type MacroNutrientsRecord,
} from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { createErrorHandler } from '~/shared/error/errorHandler'
import { calcDayMacros, calcUnifiedItemMacros } from '~/shared/utils/macroMath'

/**
 * MacroOverflowOptions controls overflow logic for macro nutrients.
 * @property enable - Whether overflow checks are enabled
 * @property originalItem - (Optional) The original item for edit scenarios
 */
export type MacroOverflowOptions = {
  enable: boolean
  originalItem?: TemplateItem
}

/**
 * MacroOverflowContext provides context for macro overflow checks.
 * @property currentDayDiet - The current day diet or null
 * @property macroTarget - The macro nutrient targets or null
 * @property macroOverflowOptions - Overflow options
 */
export type MacroOverflowContext = {
  currentDayDiet: DayDiet | null
  macroTarget: MacroNutrients | null
  macroOverflowOptions: MacroOverflowOptions
}

/**
 * Computes the difference and overflow status for a macro nutrient property.
 * @private
 * @param current - The current macro value for the day
 * @param itemValue - The macro value for the item or group
 * @param originalValue - The macro value for the original item (if editing)
 * @param target - The macro target value
 * @returns true if overflow, false otherwise
 */
function _computeOverflow(
  current: number,
  itemValue: number,
  originalValue: number,
  target: number,
): boolean {
  const difference = itemValue - originalValue
  return current + difference > target
}

/**
 * Checks if adding/editing an item would cause a macro nutrient to exceed the target.
 * @param item - The item being added or edited
 * @param property - The macro nutrient property to check ('carbs', 'protein', 'fat')
 * @param context - Context containing current day diet, macro target, and overflow options
 * @param dayMacros - (Optional) Precomputed day macros to avoid redundant calculation
 * @returns true if the macro would exceed the target, false otherwise
 */
const errorHandler = createErrorHandler('validation', 'Macro')

export function isOverflow(
  item: TemplateItem,
  property: keyof MacroNutrientsRecord,
  context: MacroOverflowContext,
  dayMacros?: MacroNutrients | null,
): boolean {
  const { currentDayDiet, macroTarget, macroOverflowOptions } = context
  // Type assertions for safety (defensive, in case of untyped input)
  if (
    typeof property !== 'string' ||
    !['carbs', 'protein', 'fat'].includes(property)
  ) {
    errorHandler.validationError('Invalid macro property for overflow check', {
      additionalData: { property, itemName: item.name },
    })
    return false
  }
  if (!macroOverflowOptions.enable) {
    return false
  }
  if (currentDayDiet === null) {
    errorHandler.validationError(
      'currentDayDiet is undefined, cannot calculate overflow',
      {
        additionalData: { property, itemName: item.name },
      },
    )
    return false
  }
  if (macroTarget === null) {
    errorHandler.validationError(
      'macroTarget is undefined, cannot calculate overflow',
      {
        additionalData: { property, itemName: item.name },
      },
    )
    return false
  }
  const itemMacros = _calcTemplateItemMacros(item)
  const originalItemMacros: MacroNutrients =
    macroOverflowOptions.originalItem !== undefined
      ? _calcTemplateItemMacros(macroOverflowOptions.originalItem)
      : createMacroNutrients({ carbs: 0, protein: 0, fat: 0 })
  const current = (dayMacros ?? calcDayMacros(currentDayDiet))[property]
  const target = macroTarget[property]
  return _computeOverflow(
    current,
    itemMacros[property],
    originalItemMacros[property],
    target,
  )
}

/**
 * Creates a function that checks overflow for all macro nutrients.
 * @param item - The item being checked
 * @param context - Context containing current day diet, macro target, and overflow options
 * @returns Object with functions to check each macro nutrient: carbs, protein, fat
 */
export function createMacroOverflowChecker(
  item: TemplateItem,
  context: MacroOverflowContext,
) {
  // Memoization: dayMacros is computed once for all checks in this object.
  const dayMacros = context.currentDayDiet
    ? calcDayMacros(context.currentDayDiet)
    : null
  return {
    carbs: () => isOverflow(item, 'carbs', context, dayMacros),
    protein: () => isOverflow(item, 'protein', context, dayMacros),
    fat: () => isOverflow(item, 'fat', context, dayMacros),
  }
}

/**
 * Calculates macros for a TemplateItem, handling both UnifiedItem and legacy Item formats.
 * @private
 */
function _calcTemplateItemMacros(item: TemplateItem): MacroNutrients {
  // Check if it's a legacy Item type with direct macros property
  if (
    'macros' in item &&
    typeof item.macros === 'object' &&
    item.macros !== null
  ) {
    // Legacy Item: macros are stored directly and proportional to quantity
    const legacyItem = item as {
      macros: MacroNutrients
      quantity: number
    }
    return createMacroNutrients({
      carbs: (legacyItem.macros.carbs * legacyItem.quantity) / 100,
      protein: (legacyItem.macros.protein * legacyItem.quantity) / 100,
      fat: (legacyItem.macros.fat * legacyItem.quantity) / 100,
    })
  }

  // Modern UnifiedItem: use the standard calculation
  return calcUnifiedItemMacros(item)
}
