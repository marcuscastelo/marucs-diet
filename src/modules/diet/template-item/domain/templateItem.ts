import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { recipeItemSchema } from '~/modules/diet/recipe-item/domain/recipeItem'

export const templateItemSchema = z.union([itemSchema, recipeItemSchema])

export type FoodTemplateItem = Readonly<z.output<typeof itemSchema>>
export type RecipeTemplateItem = Readonly<z.output<typeof recipeItemSchema>>
export type TemplateItem = FoodTemplateItem | RecipeTemplateItem

/**
 * Checks if a TemplateItem is a FoodTemplateItem (Item).
 * @param t - The TemplateItem to check
 * @returns True if t is a FoodTemplateItem
 */
export function isTemplateItemFood(t: TemplateItem): t is FoodTemplateItem {
  return t.__type === 'Item'
}

/**
 * Checks if a TemplateItem is a RecipeTemplateItem (RecipeItem).
 * @param t - The TemplateItem to check
 * @returns True if t is a RecipeTemplateItem
 */
export function isTemplateItemRecipe(t: TemplateItem): t is RecipeTemplateItem {
  return t.__type === 'RecipeItem'
}
