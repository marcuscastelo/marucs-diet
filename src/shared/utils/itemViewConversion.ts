import { type Food } from '~/modules/diet/food/domain/food'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { itemToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  isFoodItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Converts a TemplateItem to a UnifiedItem for use in UnifiedItemView
 */
export function convertTemplateItemToUnifiedItem(
  templateItem: TemplateItem,
  templateData: Food | Recipe,
): UnifiedItem {
  if (isFoodItem(templateItem)) {
    const food = templateData as Food
    return {
      id: templateItem.reference.id,
      name: food.name,
      quantity: templateItem.quantity,
      reference: {
        type: 'food',
        id: templateItem.reference.id,
        macros: food.macros,
      },
      __type: 'UnifiedItem',
    }
  } else if (isRecipeItem(templateItem)) {
    const recipe = templateData as Recipe
    return {
      id: templateItem.reference.id,
      name: recipe.name,
      quantity: templateItem.quantity,
      reference: {
        type: 'recipe',
        id: templateItem.reference.id,
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
  // Determine type based on templateData.__type
  if (templateData.__type === 'Food') {
    const food = templateData
    return {
      id: item.reference,
      name: food.name,
      quantity: item.quantity,
      reference: {
        type: 'food',
        id: item.reference,
        macros: food.macros,
      },
      __type: 'UnifiedItem',
    }
  } else {
    const recipe = templateData
    return {
      id: item.reference,
      name: recipe.name,
      quantity: item.quantity,
      reference: {
        type: 'recipe',
        id: item.reference,
        children: recipe.items.map((item) => itemToUnifiedItem(item)),
      },
      __type: 'UnifiedItem',
    }
  }
}
