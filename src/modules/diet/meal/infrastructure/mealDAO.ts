import { z } from 'zod/v4'

import { migrateUnifiedMealToLegacy } from '~/modules/diet/day-diet/infrastructure/migrationUtils'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

// DAO schema for database record (current unified format)
export const mealDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(unifiedItemSchema),
})

// Legacy DAO schema for database record (groups format for canary strategy)
export const legacyMealDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  groups: z.array(itemGroupSchema),
})

export type LegacyMealDAO = z.infer<typeof legacyMealDAOSchema>

/**
 * Converts a domain Meal object to a legacy DAO object for database storage (canary strategy)
 */
export function mealToLegacyDAO(meal: Meal): LegacyMealDAO {
  const legacyMeal = migrateUnifiedMealToLegacy(meal)
  return {
    id: legacyMeal.id,
    name: legacyMeal.name,
    groups: legacyMeal.groups,
  }
}
