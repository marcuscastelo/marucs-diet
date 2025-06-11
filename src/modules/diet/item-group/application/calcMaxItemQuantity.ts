import { calcItemMacros } from '~/legacy/utils/macroMath'
import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { stringToDate } from '~/shared/utils/date/dateUtils'

/**
 * Calculates the maximum allowed quantity for a food item based on macro targets for the current day.
 * @param item - The item to calculate the max quantity for
 * @returns The max allowed quantity (number)
 */
export function calcMaxItemQuantity(item: TemplateItem): number {
  const dayDiet = currentDayDiet()
  if (!dayDiet) return 0
  const macroTargets = getMacroTargetForDay(stringToDate(dayDiet.target_day))
  if (!macroTargets) return 0
  const itemMacros = calcItemMacros(item)
  const macroKeys: (keyof typeof itemMacros)[] = ['carbs', 'protein', 'fat']
  let max = Infinity
  for (const macro of macroKeys) {
    const per100g = itemMacros[macro]
    const macroTarget = macroTargets[macro]
    if (
      typeof per100g === 'number' &&
      per100g > 0 &&
      typeof macroTarget === 'number'
    ) {
      const allowed = Math.floor(macroTarget / per100g)
      if (allowed < max) {
        max = allowed
      }
    }
  }
  return max === Infinity ? 0 : max * 0.96
}
