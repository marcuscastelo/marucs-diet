import { z } from 'zod/v4'

import {
  type DayDiet,
  dayDietSchema,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import {
  legacyMealDAOSchema,
  mealDAOSchema,
  mealToLegacyDAO,
} from '~/modules/diet/meal/infrastructure/mealDAO'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// DAO schema for creating new day diets in legacy format (canary strategy)
export const createLegacyDayDietDAOSchema = z.object({
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(legacyMealDAOSchema),
})

// DAO schema for creating new day diets in unified format (direct UnifiedItem persistence)
export const createDayDietDAOSchema = z.object({
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(mealDAOSchema),
})

// DAO schema for database record
export const dayDietDAOSchema = z.object({
  id: z.number(),
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(mealDAOSchema),
})

export type CreateDayDietDAO = z.infer<typeof createDayDietDAOSchema>
export type CreateLegacyDayDietDAO = z.infer<
  typeof createLegacyDayDietDAOSchema
>
export type DayDietDAO = z.infer<typeof dayDietDAOSchema>

/**
 * Converts a NewDayDiet object to a CreateDayDietDAO for direct UnifiedItem database operations
 */
export function createDayDietDAOFromNewDayDiet(
  newDayDiet: NewDayDiet,
): CreateDayDietDAO {
  return parseWithStack(createDayDietDAOSchema, {
    target_day: newDayDiet.target_day,
    owner: newDayDiet.owner,
    meals: newDayDiet.meals, // Use meals directly with UnifiedItems
  })
}

/**
 * Converts a NewDayDiet object to a CreateLegacyDayDietDAO for database operations (canary strategy)
 */
export function createInsertLegacyDayDietDAOFromNewDayDiet(
  newDayDiet: NewDayDiet,
): CreateLegacyDayDietDAO {
  return parseWithStack(createLegacyDayDietDAOSchema, {
    target_day: newDayDiet.target_day,
    owner: newDayDiet.owner,
    meals: newDayDiet.meals.map(mealToLegacyDAO),
  })
}

/**
 * Converts a DAO object from database to domain DayDiet object
 */
export function daoToDayDiet(dao: DayDietDAO): DayDiet {
  return parseWithStack(dayDietSchema, {
    id: dao.id,
    target_day: dao.target_day,
    owner: dao.owner,
    meals: dao.meals,
  })
}
