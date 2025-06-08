import { z } from 'zod'

import { foodSchema } from '~/modules/diet/food/domain/food'
import { recipeSchema } from '~/modules/diet/recipe/domain/recipe'

export const templateSchema = z.union([foodSchema, recipeSchema])

export type FoodTemplate = Readonly<z.output<typeof foodSchema>>
export type RecipeTemplate = Readonly<z.output<typeof recipeSchema>>
export type Template = FoodTemplate | RecipeTemplate

/**
 * Type guard for Template (food).
 * @param t - The Template to check
 * @returns True if Template is food
 */
export function isTemplateFood(t: Template): t is FoodTemplate {
  return t.__type === 'Food'
}

/**
 * Type guard for Template (recipe).
 * @param t - The Template to check
 * @returns True if Template is recipe
 */
export function isTemplateRecipe(t: Template): t is RecipeTemplate {
  return t.__type === 'Recipe'
}
