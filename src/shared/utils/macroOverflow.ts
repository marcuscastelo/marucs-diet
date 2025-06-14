import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { handleValidationError } from '~/shared/error/errorHandler'
import { calcDayMacros, calcItemMacros } from '~/shared/utils/macroMath'

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
export function isOverflow(
  item: TemplateItem,
  property: keyof MacroNutrients,
  context: MacroOverflowContext,
  dayMacros?: MacroNutrients | null,
): boolean {
  const { currentDayDiet, macroTarget, macroOverflowOptions } = context
  // Type assertions for safety (defensive, in case of untyped input)
  if (
    typeof property !== 'string' ||
    !['carbs', 'protein', 'fat'].includes(property)
  ) {
    handleValidationError('Invalid macro property for overflow check', {
      component: 'macroOverflow',
      operation: 'isOverflow',
      additionalData: { property, itemName: item.name },
    })
    return false
  }
  if (!macroOverflowOptions.enable) {
    return false
  }
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
  const itemMacros = calcItemMacros(item)
  const originalItemMacros: MacroNutrients =
    macroOverflowOptions.originalItem !== undefined
      ? calcItemMacros(macroOverflowOptions.originalItem)
      : { carbs: 0, protein: 0, fat: 0 }
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
 * Checks if adding a group of items would cause a macro nutrient to exceed the target.
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
  // Type assertions for safety (defensive, in case of untyped input)
  if (
    typeof property !== 'string' ||
    !['carbs', 'protein', 'fat'].includes(property)
  ) {
    handleValidationError('Invalid macro property for overflow check', {
      component: 'macroOverflow',
      operation: 'isOverflowForItemGroup',
      additionalData: { property },
    })
    return false
  }
  if (items.length === 0) {
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
  const hasOriginalItem = macroOverflowOptions.originalItem !== undefined
  const originalItemMacros: MacroNutrients = hasOriginalItem
    ? calcItemMacros(macroOverflowOptions.originalItem!)
    : { carbs: 0, protein: 0, fat: 0 }
  const current = calcDayMacros(currentDayDiet)[property]
  const target = macroTarget[property]
  return _computeOverflow(
    current,
    totalMacros[property],
    originalItemMacros[property],
    target,
  )
}
