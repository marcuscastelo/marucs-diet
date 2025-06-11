import { calcItemMacros } from '~/legacy/utils/macroMath'
import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { applyItemEdit } from '~/modules/diet/item-group/application/applyItemEdit'
import { type MacroContributorEntry } from '~/modules/diet/item-group/domain/types'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

/**
 * Returns the top N items that, if reduced, most effectively decrease a single macro (carbs, protein, or fat) with minimal impact on others.
 * Ranks by total macro contribution, then by macro density (macro per gram).
 * @param macro - The macro nutrient to analyze ('carbs', 'protein' | 'fat')
 * @param n - Number of top contributors to return
 * @returns Array of { item, handleApply }
 */
// getTopContributors.ts
export function getTopContributors(
  macro: 'carbs' | 'protein' | 'fat',
  n = 3,
): MacroContributorEntry[] {
  const dayDiet = currentDayDiet()
  const allItems =
    dayDiet?.meals.flatMap((meal) =>
      meal.groups.flatMap((group) => group.items),
    ) ?? []

  const scored = allItems.map((item) => {
    const macros = calcItemMacros(item)
    const macroTotal = macros[macro] * item.quantity
    const macroDensity = macros[macro]
    const macroSum = macros.carbs + macros.protein + macros.fat
    const macroProportion = macroSum > 0 ? macros[macro] / macroSum : 0
    return {
      item,
      macroTotal,
      macroDensity,
      macroProportion,
    }
  })

  scored.sort((a, b) => {
    if (b.macroProportion !== a.macroProportion)
      return b.macroProportion - a.macroProportion
    if (b.macroTotal !== a.macroTotal) return b.macroTotal - a.macroTotal
    return b.macroDensity - a.macroDensity
  })

  return scored.slice(0, n).map(({ item }) => ({
    item,
    handleApply: applyItemEdit,
  }))
}
