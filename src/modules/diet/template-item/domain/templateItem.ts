import {
  type FoodItem,
  type GroupItem,
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type RecipeItem,
  UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export const templateItemSchema = unifiedItemSchema

type FoodTemplateItem = FoodItem
type RecipeTemplateItem = RecipeItem
type GroupTemplateItem = GroupItem
export type TemplateItem =
  | FoodTemplateItem
  | RecipeTemplateItem
  | GroupTemplateItem

export function isTemplateItem(t: UnifiedItem): t is TemplateItem {
  return isFoodItem(t) || isRecipeItem(t) || isGroupItem(t)
}
