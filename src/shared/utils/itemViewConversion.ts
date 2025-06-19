import { type Food } from '~/modules/diet/food/domain/food'
import { createItem, type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { type ItemViewProps } from '~/sections/food-item/components/ItemView'
import { type UnifiedItemViewProps } from '~/sections/unified-item/components/UnifiedItemView'

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

/**
 * Converts ItemViewProps handlers to UnifiedItemViewProps handlers
 */
export function convertItemViewHandlers(
  handlers: ItemViewProps['handlers'],
): UnifiedItemViewProps['handlers'] {
  return {
    onClick: handlers.onClick
      ? (unifiedItem: UnifiedItem) => {
          // Convert UnifiedItem back to TemplateItem for legacy handler
          const templateItem = convertUnifiedItemToTemplateItem(unifiedItem)
          handlers.onClick!(templateItem)
        }
      : undefined,
    onEdit: handlers.onEdit
      ? (unifiedItem: UnifiedItem) => {
          const templateItem = convertUnifiedItemToTemplateItem(unifiedItem)
          handlers.onEdit!(templateItem)
        }
      : undefined,
    onCopy: handlers.onCopy
      ? (unifiedItem: UnifiedItem) => {
          const templateItem = convertUnifiedItemToTemplateItem(unifiedItem)
          handlers.onCopy!(templateItem)
        }
      : undefined,
    onDelete: handlers.onDelete
      ? (unifiedItem: UnifiedItem) => {
          const templateItem = convertUnifiedItemToTemplateItem(unifiedItem)
          handlers.onDelete!(templateItem)
        }
      : undefined,
  }
}

/**
 * Converts a UnifiedItem back to a TemplateItem (for legacy compatibility)
 */
function convertUnifiedItemToTemplateItem(
  unifiedItem: UnifiedItem,
): TemplateItem {
  const reference = unifiedItem.reference

  if (reference.type === 'food') {
    return createItem({
      name: unifiedItem.name,
      quantity: unifiedItem.quantity,
      macros: reference.macros,
      reference: reference.id,
    }) as TemplateItem
  } else if (reference.type === 'recipe') {
    // Create a RecipeItem-like structure
    return {
      id: unifiedItem.id,
      name: unifiedItem.name,
      quantity: unifiedItem.quantity,
      macros: { carbs: 0, fat: 0, protein: 0 }, // Placeholder macros for recipes
      reference: reference.id,
      __type: 'RecipeItem' as const,
    } as TemplateItem
  } else {
    throw new Error(
      `Cannot convert UnifiedItem with type ${reference.type} to TemplateItem`,
    )
  }
}
