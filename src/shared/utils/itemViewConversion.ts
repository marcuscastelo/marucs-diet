import { type Food } from '~/modules/diet/food/domain/food'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Converts a TemplateItem to a UnifiedItem for use in UnifiedItemView
 */
export function convertTemplateItemToUnifiedItem(
  templateItem: TemplateItem,
  templateData: Food | Recipe,
): UnifiedItem {
  if (isTemplateItemFood(templateItem)) {
    const food = templateData as Food
    return {
      id: templateItem.reference,
      name: food.name,
      quantity: templateItem.quantity,
      reference: {
        type: 'food',
        id: templateItem.reference,
        macros: food.macros,
      },
      __type: 'UnifiedItem',
    }
  } else if (isTemplateItemRecipe(templateItem)) {
    const recipe = templateData as Recipe
    return {
      id: templateItem.reference,
      name: recipe.name,
      quantity: templateItem.quantity,
      reference: {
        type: 'recipe',
        id: templateItem.reference,
        children: [], // Recipe children would need to be populated separately
      },
      __type: 'UnifiedItem',
    }
  } else {
    throw new Error(
      `Unknown template item type: ${JSON.stringify(templateItem)}`,
    )
  }
}

/**
 * Converts an Item to a UnifiedItem for use in UnifiedItemView
 */
export function convertItemToUnifiedItem(
  item: Item,
  templateData: Food | Recipe,
): UnifiedItem {
  // Create a TemplateItem from Item and then convert
  const templateItem: TemplateItem = {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    macros: item.macros,
    reference: item.reference,
    __type: item.__type,
  }

  return convertTemplateItemToUnifiedItem(templateItem, templateData)
}
