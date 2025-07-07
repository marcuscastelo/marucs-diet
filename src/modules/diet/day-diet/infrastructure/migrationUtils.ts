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

  const now = new Date()
  return {
    id: legacyMeal.id,
    userId: 1, // Default for legacy migration
    name: legacyMeal.name,
    description: null,
    createdAt: now,
    updatedAt: now,
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

  // Convert standalone items to individual groups (each item gets its own group)
  const allGroups: ItemGroup[] = [...groups]

  // Each standalone item should become its own group
  for (const item of items) {
    const now = new Date()
    allGroups.push({
      id: item.id,
      userId: item.userId,
      name: item.name, // Use the item's name as the group name
      description: null,
      createdAt: now,
      updatedAt: now,
      items: [item],
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
