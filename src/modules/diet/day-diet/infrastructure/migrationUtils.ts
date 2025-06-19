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
  // Convert each group to a UnifiedItem, preserving group structure including empty groups
  const unifiedItems = migrateToUnifiedItems([], legacyMeal.groups)

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

  // Convert standalone items to groups with intelligent naming
  const allGroups: ItemGroup[] = [...groups]
  if (items.length > 0) {
    if (items.length === 1) {
      // For single items (flattened from unit groups), use the item's name
      allGroups.push({
        id: -1, // Temporary ID for single-item group
        name: items[0]!.name,
        items,
        recipe: undefined,
        __type: 'ItemGroup',
      })
    } else {
      // For multiple items, use a default group name
      allGroups.push({
        id: -1, // Temporary ID for default group
        name: 'Items',
        items,
        recipe: undefined,
        __type: 'ItemGroup',
      })
    }
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
