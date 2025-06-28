import { createRecipedItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { scaleRecipeByPreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
import {
  isTemplateRecipe,
  type Template,
} from '~/modules/diet/template/domain/template'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { itemGroupToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  isFoodItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Creates a UnifiedItem from a Template and TemplateItem.
 * This is the new unified approach that directly creates UnifiedItems.
 *
 * @param template - The Template (food or recipe)
 * @param item - The TemplateItem containing user's desired quantity
 * @returns Object with unifiedItem, operation, templateType
 */
export function createUnifiedItemFromTemplate(
  template: Template,
  item: TemplateItem,
): { unifiedItem: UnifiedItem; operation: string; templateType: string } {
  if (isFoodItem(item)) {
    return {
      unifiedItem: item,
      operation: 'addUnifiedItem',
      templateType: 'Item',
    }
  }

  if (isTemplateRecipe(template) && isRecipeItem(item)) {
    // Scale the recipe items based on the user's desired quantity
    const { scaledItems } = scaleRecipeByPreparedQuantity(
      template,
      item.quantity,
    )

    // Create a group and convert to UnifiedItem
    const group = createRecipedItemGroup({
      name: item.name,
      recipe: template.id,
      items: scaledItems,
    })

    const unifiedItem = itemGroupToUnifiedItem(group)
    return {
      unifiedItem,
      operation: 'addUnifiedRecipeItem',
      templateType: 'Recipe',
    }
  }

  throw new Error('Template is not a Recipe or item type mismatch')
}
