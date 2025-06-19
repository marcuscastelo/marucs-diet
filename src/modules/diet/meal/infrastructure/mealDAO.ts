import { z } from 'zod'

import { type Meal, mealSchema } from '~/modules/diet/meal/domain/meal'
import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// DAO schema for creating new meals
export const createMealDAOSchema = z.object({
  name: z.string(),
  items: z.array(unifiedItemSchema),
})

// DAO schema for updating existing meals
export const updateMealDAOSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  items: z.array(unifiedItemSchema).optional(),
})

// DAO schema for database record
export const mealDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(unifiedItemSchema),
})

export type CreateMealDAO = z.infer<typeof createMealDAOSchema>
export type UpdateMealDAO = z.infer<typeof updateMealDAOSchema>
export type MealDAO = z.infer<typeof mealDAOSchema>

/**
 * Converts a domain Meal object to a DAO object for database storage
 */
export function mealToDAO(meal: Meal): MealDAO {
  return {
    id: meal.id,
    name: meal.name,
    items: meal.items,
  }
}

/**
 * Converts a DAO object from database to domain Meal object
 */
export function daoToMeal(dao: MealDAO): Meal {
  return parseWithStack(mealSchema, {
    id: dao.id,
    name: dao.name,
    items: dao.items,
  })
}

/**
 * Converts CreateMealDAO to MealDAO for database operations
 */
export function createMealDAOToDAO(
  createDAO: CreateMealDAO,
  id: number,
): MealDAO {
  return parseWithStack(mealDAOSchema, {
    id,
    name: createDAO.name,
    items: createDAO.items,
  })
}

/**
 * Merges UpdateMealDAO with existing MealDAO for database updates
 */
export function mergeUpdateMealDAO(
  existing: MealDAO,
  update: UpdateMealDAO,
): MealDAO {
  return parseWithStack(mealDAOSchema, {
    ...existing,
    ...update,
  })
}
