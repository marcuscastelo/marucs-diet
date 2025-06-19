import { type Item } from '~/modules/diet/item/domain/item'
import {
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  createUnifiedItem,
  isFood,
  isGroup,
  isRecipe,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Application services for item operations using UnifiedItem structure
 */

/**
 * Updates the quantity of an item (legacy compatibility)
 * @deprecated Use updateUnifiedItemQuantity instead
 */
export function updateItemQuantity(
  item: Item,
  quantity: Item['quantity'],
): Item {
  return {
    ...item,
    quantity,
  }
}

/**
 * Updates the quantity of a UnifiedItem
 */
export function updateUnifiedItemQuantity(
  item: UnifiedItem,
  quantity: UnifiedItem['quantity'],
): UnifiedItem {
  const quantityFactor = quantity / item.quantity

  if (isFood(item)) {
    return createUnifiedItem({
      ...item,
      quantity,
      reference: { ...item.reference },
    })
  }

  if (isRecipe(item)) {
    return createUnifiedItem({
      ...item,
      quantity,
      reference: {
        ...item.reference,
        children: item.reference.children.map((child) => ({
          ...child,
          quantity: child.quantity * quantityFactor,
        })),
      },
    })
  }

  if (isGroup(item)) {
    return createUnifiedItem({
      ...item,
      quantity,
      reference: {
        ...item.reference,
        children: item.reference.children.map((child) => ({
          ...child,
          quantity: child.quantity * quantityFactor,
        })),
      },
    })
  }

  // Fallback (should never happen)
  return item satisfies never
}

/**
 * Updates the name of a UnifiedItem
 */
export function updateUnifiedItemName(
  item: UnifiedItem,
  name: UnifiedItem['name'],
): UnifiedItem {
  return {
    ...item,
    name,
  }
}

/**
 * Converts legacy Item to UnifiedItem for application operations
 */
export function convertItemToUnified(item: Item): UnifiedItem {
  return itemToUnifiedItem(item)
}

/**
 * Converts UnifiedItem back to legacy Item (compatibility)
 */
export function convertUnifiedToItem(item: UnifiedItem): Item {
  return unifiedItemToItem(item)
}
