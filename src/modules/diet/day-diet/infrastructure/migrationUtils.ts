import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  migrateFromUnifiedItems,
  migrateToUnifiedItems,
} from '~/modules/diet/unified-item/domain/migrationUtils'

/**
 * Legacy meal structure for migration compatibility
 */
export type LegacyMeal = {
  id: number
  name: string
  groups: ItemGroup[]
  __type: 'Meal'
}

/**
 * Migrates a legacy meal (with groups containing items) to a unified meal (with unified items)
 * @param legacyMeal LegacyMeal with groups
 * @returns Meal with unified items
 */
export function migrateLegacyMealToUnified(legacyMeal: LegacyMeal): Meal {
  const allItems = legacyMeal.groups.flatMap((group) => group.items)
  const unifiedItems = migrateToUnifiedItems(allItems, [])

  return {
    id: legacyMeal.id,
    name: legacyMeal.name,
    items: unifiedItems,
    __type: 'Meal',
  }
}

/**
 * Migrates a unified meal back to legacy format for compatibility
 * @param unifiedMeal Meal with unified items
 * @returns LegacyMeal with groups
 */
export function migrateUnifiedMealToLegacy(unifiedMeal: Meal): LegacyMeal {
  const { items, groups } = migrateFromUnifiedItems(unifiedMeal.items)

  // Convert standalone items to a default group
  const allGroups: ItemGroup[] = [...groups]
  if (items.length > 0) {
    allGroups.push({
      id: -1, // Temporary ID for default group
      name: 'Default',
      items,
      recipe: undefined,
      __type: 'ItemGroup',
    })
  }

  return {
    id: unifiedMeal.id,
    name: unifiedMeal.name,
    groups: allGroups,
    __type: 'Meal',
  }
}

/**
 * Migrates an array of legacy meals to unified format
 * @param legacyMeals LegacyMeal[]
 * @returns Meal[]
 */
export function migrateLegacyMealsToUnified(legacyMeals: LegacyMeal[]): Meal[] {
  return legacyMeals.map(migrateLegacyMealToUnified)
}

/**
 * Migrates an array of unified meals back to legacy format
 * @param unifiedMeals Meal[]
 * @returns LegacyMeal[]
 */
export function migrateUnifiedMealsToLegacy(
  unifiedMeals: Meal[],
): LegacyMeal[] {
  return unifiedMeals.map(migrateUnifiedMealToLegacy)
}
