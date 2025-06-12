import { z } from 'zod'

import {
  NewRecipe,
  newRecipeSchema,
  Recipe,
  recipeSchema,
} from '~/modules/diet/recipe/domain/recipe'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * Validates and transforms a raw object into a Recipe domain object.
 * @param input - The raw object to validate/transform
 * @returns The validated Recipe object
 */
export function transformRecipe(input: unknown): Recipe {
  return parseWithStack(recipeSchema, input)
}

/**
 * Validates and transforms a raw object into a NewRecipe domain object.
 * @param input - The raw object to validate/transform
 * @returns The validated NewRecipe object
 */
export function transformNewRecipe(input: unknown): NewRecipe {
  return parseWithStack(newRecipeSchema, input)
}
