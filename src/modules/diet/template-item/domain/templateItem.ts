import { z } from 'zod'
import { itemSchema } from '~/modules/diet/item/domain/item'
import { recipeItemSchema } from '~/modules/diet/recipe-item/domain/recipeItem'

export const templateItemSchema = z.union([itemSchema, recipeItemSchema])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>

/**
 * Type guard for TemplateItem (Item).
 * @param t - The TemplateItem to check
 * @returns True if TemplateItem is Item
 */
export function isTemplateItemFood(
  t: TemplateItem,
): t is Readonly<z.output<typeof itemSchema>> {
  return t.__type === 'Item'
}

/**
 * Type guard for TemplateItem (RecipeItem).
 * @param t - The TemplateItem to check
 * @returns True if TemplateItem is RecipeItem
 */
export function isTemplateItemRecipe(
  t: TemplateItem,
): t is Readonly<z.output<typeof recipeItemSchema>> {
  return t.__type === 'RecipeItem'
}
