import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import {
  type NewRecipe,
  type Recipe,
  recipeSchema,
} from '~/modules/diet/recipe/domain/recipe'

// Base schema (with ID)
export const recipeDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(itemSchema),
  prepared_multiplier: z.number(),
})

// Schema for creation (without ID)
export const createRecipeDAOSchema = recipeDAOSchema.omit({ id: true })

// Schema for update (optional fields, without ID)
export const updateRecipeDAOSchema = recipeDAOSchema
  .omit({ id: true })
  .partial()

// Types
export type RecipeDAO = z.infer<typeof recipeDAOSchema>
export type CreateRecipeDAO = z.infer<typeof createRecipeDAOSchema>
export type UpdateRecipeDAO = z.infer<typeof updateRecipeDAOSchema>

// Conversions
export function createRecipeDAO(recipe: Recipe): RecipeDAO {
  return recipeDAOSchema.parse({
    id: recipe.id,
    name: recipe.name,
    owner: recipe.owner,
    items: [...recipe.items],
    prepared_multiplier: recipe.prepared_multiplier,
  })
}

export function createInsertRecipeDAO(
  recipe: Omit<Recipe, 'id' | '__type'>,
): CreateRecipeDAO {
  return createRecipeDAOSchema.parse({
    name: recipe.name,
    owner: recipe.owner,
    items: [...recipe.items],
    prepared_multiplier: recipe.prepared_multiplier,
  })
}

export function createRecipeFromDAO(dao: RecipeDAO): Recipe {
  return recipeSchema.parse({
    ...dao,
    items: [...dao.items],
  })
}

export function createInsertRecipeDAOFromNewRecipe(
  newRecipe: NewRecipe,
): CreateRecipeDAO {
  return createRecipeDAOSchema.parse({
    name: newRecipe.name,
    owner: newRecipe.owner,
    items: [...newRecipe.items],
    prepared_multiplier: newRecipe.prepared_multiplier,
  })
}

export function createUpdateRecipeDAOFromRecipe(
  recipe: Recipe,
): UpdateRecipeDAO {
  return updateRecipeDAOSchema.parse({
    name: recipe.name,
    owner: recipe.owner,
    items: [...recipe.items],
    prepared_multiplier: recipe.prepared_multiplier,
  })
}
