import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type Food, foodSchema, type NewFood } from '~/modules/diet/food/domain/food'
import { z } from 'zod'

// Base schema (with ID)
export const foodDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  ean: z.string().nullable().optional(),
  macros: macroNutrientsSchema,
  source: z
    .object({
      type: z.literal('api'),
      id: z.string(),
    })
    .nullable()
    .optional(),
  recipeId: z.number().nullable().optional(),
})

// Schema for creation (without ID)
export const createFoodDAOSchema = foodDAOSchema.omit({ id: true })

// Schema for update (optional fields, without ID)
export const updateFoodDAOSchema = foodDAOSchema.omit({ id: true }).partial()

// Types
export type FoodDAO = z.infer<typeof foodDAOSchema>
export type CreateFoodDAO = z.infer<typeof createFoodDAOSchema>
export type UpdateFoodDAO = z.infer<typeof updateFoodDAOSchema>

// Conversions
export function createFoodDAO(food: Food): FoodDAO {
  return foodDAOSchema.parse({
    id: food.id,
    name: food.name,
    ean: food.ean ?? null,
    macros: food.macros,
    source: food.source ?? null,
    recipeId: food.recipeId ?? null,
  })
}

export function createInsertFoodDAO(food: Omit<Food, 'id' | '__type'>): CreateFoodDAO {
  return createFoodDAOSchema.parse({
    name: food.name,
    ean: food.ean ?? null,
    macros: food.macros,
    source: food.source ?? null,
    recipeId: food.recipeId ?? null,
  })
}

export function createFoodFromDAO(dao: FoodDAO): Food {
  return foodSchema.parse({
    ...dao,
    ean: dao.ean ?? undefined,
    source: dao.source ?? undefined,
    recipeId: dao.recipeId ?? undefined,
  })
}

export function createInsertFoodDAOFromNewFood(newFood: NewFood): CreateFoodDAO {
  return createFoodDAOSchema.parse({
    name: newFood.name,
    ean: newFood.ean ?? null,
    macros: newFood.macros,
    source: newFood.source ?? null,
    recipeId: newFood.recipeId ?? null,
  })
}

export function createUpdateFoodDAOFromFood(food: Food): UpdateFoodDAO {
  return updateFoodDAOSchema.parse({
    name: food.name,
    ean: food.ean ?? null,
    macros: food.macros,
    source: food.source ?? null,
    recipeId: food.recipeId ?? null,
  })
}
