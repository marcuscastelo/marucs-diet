import {
  type FoodItem,
  type GroupItem,
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type RecipeItem,
  UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export type TemplateItem = FoodItem | RecipeItem | GroupItem

export function isTemplateItem(t: UnifiedItem): t is TemplateItem {
  return isFoodItem(t) || isRecipeItem(t) || isGroupItem(t)
}
