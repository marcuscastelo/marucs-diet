import { z } from 'zod'
import { type Meal, mealSchema } from '~/modules/diet/meal/domain/meal'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'

// DAO schema for creating new meals
export const createMealDAOSchema = z.object({
  name: z.string(),
  groups: z.array(itemGroupSchema),
})

// DAO schema for updating existing meals
export const updateMealDAOSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  groups: z.array(itemGroupSchema).optional(),
})

// DAO schema for database record
export const mealDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  groups: z.array(itemGroupSchema),
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
    groups: meal.groups,
  }
}

/**
 * Converts a DAO object from database to domain Meal object
 */
export function daoToMeal(dao: MealDAO): Meal {
  return mealSchema.parse({
    id: dao.id,
    name: dao.name,
    groups: dao.groups,
  })
}

/**
 * Converts CreateMealDAO to MealDAO for database operations
 */
export function createMealDAOToDAO(
  createDAO: CreateMealDAO,
  id: number,
): MealDAO {
  return mealDAOSchema.parse({
    id,
    name: createDAO.name,
    groups: createDAO.groups,
  })
}

/**
 * Merges UpdateMealDAO with existing MealDAO for database updates
 */
export function mergeUpdateMealDAO(
  existing: MealDAO,
  update: UpdateMealDAO,
): MealDAO {
  return mealDAOSchema.parse({
    ...existing,
    ...update,
  })
}
