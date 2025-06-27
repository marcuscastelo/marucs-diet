import { type Food } from '~/modules/diet/food/domain/food'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { itemToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

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
