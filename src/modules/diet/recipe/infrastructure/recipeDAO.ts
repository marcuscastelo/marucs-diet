import { calcItemContainerMacros } from '@/legacy/utils/macroMath'
import { foodItemSchema } from '@/modules/diet/food-item/domain/foodItem'
import { Recipe, recipeSchema } from '@/modules/diet/recipe/domain/recipe'

import { z } from 'zod'

export const recipeDAOSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(foodItemSchema),
  prepared_multiplier: z.number(),
})

export type RecipeDAO = z.infer<typeof recipeDAOSchema>

export function createRecipeDAO(recipe: Recipe): RecipeDAO {
  return recipeDAOSchema.parse({
    id: recipe.id,
    name: recipe.name,
    owner: recipe.owner,
    items: [...recipe.items],
    prepared_multiplier: recipe.prepared_multiplier,
  } satisfies RecipeDAO)
}

export function createRecipeFromDAO(recipeDAO: RecipeDAO): Recipe {
  return recipeSchema.parse({
    id: recipeDAO.id,
    name: recipeDAO.name,
    owner: recipeDAO.owner,
    items: [...recipeDAO.items],
    macros: calcItemContainerMacros(recipeDAO),
    prepared_multiplier: recipeDAO.prepared_multiplier,
    __type: 'Recipe',
  })
}
