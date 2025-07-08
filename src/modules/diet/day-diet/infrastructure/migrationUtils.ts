import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  createNewMeal,
  type Meal,
  promoteMeal,
} from '~/modules/diet/meal/domain/meal'
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

  return promoteMeal(
    createNewMeal({
      name: legacyMeal.name,
      items: unifiedItems,
    }),
    legacyMeal.id,
  )
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
    allGroups.push({
      ...createSimpleItemGroup({
        name: item.name,
        items: [item],
      }),
      id: item.id,
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
