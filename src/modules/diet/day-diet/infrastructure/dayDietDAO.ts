import { z } from 'zod'

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

// DAO schema for creating new day diets
export const createDayDietDAOSchema = z.object({
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(mealDAOSchema),
})

// DAO schema for creating new day diets in legacy format (canary strategy)
export const createLegacyDayDietDAOSchema = z.object({
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(legacyMealDAOSchema),
})

// DAO schema for updating existing day diets
export const updateDayDietDAOSchema = z.object({
  id: z.number(),
  target_day: z.string().optional(),
  owner: z.number().optional(),
  meals: z.array(mealDAOSchema).optional(),
})

// DAO schema for updating existing day diets in legacy format (canary strategy)
export const updateLegacyDayDietDAOSchema = z.object({
  id: z.number(),
  target_day: z.string().optional(),
  owner: z.number().optional(),
  meals: z.array(legacyMealDAOSchema).optional(),
})

// DAO schema for database record
export const dayDietDAOSchema = z.object({
  id: z.number(),
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(mealDAOSchema),
})

// Legacy DAO schema for database record (canary strategy)
export const legacyDayDietDAOSchema = z.object({
  id: z.number(),
  target_day: z.string(),
  owner: z.number(),
  meals: z.array(legacyMealDAOSchema),
})

export type CreateDayDietDAO = z.infer<typeof createDayDietDAOSchema>
export type CreateLegacyDayDietDAO = z.infer<
  typeof createLegacyDayDietDAOSchema
>
export type UpdateDayDietDAO = z.infer<typeof updateDayDietDAOSchema>
export type UpdateLegacyDayDietDAO = z.infer<
  typeof updateLegacyDayDietDAOSchema
>
export type DayDietDAO = z.infer<typeof dayDietDAOSchema>
export type LegacyDayDietDAO = z.infer<typeof legacyDayDietDAOSchema>

/**
 * Converts a domain DayDiet object to a DAO object for database storage
 */
export function dayDietToDAO(dayDiet: DayDiet): DayDietDAO {
  return {
    id: dayDiet.id,
    target_day: dayDiet.target_day,
    owner: dayDiet.owner,
    meals: dayDiet.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      items: meal.items,
    })),
  }
}

/**
 * Converts a domain DayDiet object to a legacy DAO object for database storage (canary strategy)
 */
export function dayDietToLegacyDAO(dayDiet: DayDiet): LegacyDayDietDAO {
  return {
    id: dayDiet.id,
    target_day: dayDiet.target_day,
    owner: dayDiet.owner,
    meals: dayDiet.meals.map(mealToLegacyDAO),
  }
}

/**
 * Converts a NewDayDiet object to a CreateDayDietDAO for database operations
 */
export function createInsertDayDietDAOFromNewDayDiet(
  newDayDiet: NewDayDiet,
): CreateDayDietDAO {
  return parseWithStack(createDayDietDAOSchema, {
    target_day: newDayDiet.target_day,
    owner: newDayDiet.owner,
    meals: newDayDiet.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      items: meal.items,
    })),
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

/**
 * Converts CreateDayDietDAO to DayDietDAO for database operations
 */
export function createDayDietDAOToDAO(
  createDAO: CreateDayDietDAO,
  id: number,
): DayDietDAO {
  return parseWithStack(dayDietDAOSchema, {
    id,
    target_day: createDAO.target_day,
    owner: createDAO.owner,
    meals: createDAO.meals,
  })
}

/**
 * Merges UpdateDayDietDAO with existing DayDietDAO for database updates
 */
export function mergeUpdateDayDietDAO(
  existing: DayDietDAO,
  update: UpdateDayDietDAO,
): DayDietDAO {
  return parseWithStack(dayDietDAOSchema, {
    ...existing,
    ...update,
  })
}
