import { type Food } from '~/modules/diet/food/domain/food'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'

export type Template = Food | Recipe

/**
 * Type guard for Template (food).
 * @param t - The Template to check
 * @returns True if Template is food
 */
export function isTemplateFood(t: Template): t is Food {
  return 'ean' in t && 'macros' in t && !('owner' in t)
}

/**
 * Type guard for Template (recipe).
 * @param t - The Template to check
 * @returns True if Template is recipe
 */
export function isTemplateRecipe(t: Template): t is Recipe {
  return 'owner' in t && 'items' in t && 'prepared_multiplier' in t
}
