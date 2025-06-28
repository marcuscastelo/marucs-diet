import { type Item } from '~/modules/diet/item/domain/item'
import {
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  createUnifiedItem,
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Updates the quantity of a UnifiedItem
 */
export function updateUnifiedItemQuantity(
  item: UnifiedItem,
  quantity: UnifiedItem['quantity'],
): UnifiedItem {
  const quantityFactor = quantity / item.quantity

  if (isFoodItem(item)) {
    return createUnifiedItem({
      ...item,
      quantity,
      reference: { ...item.reference },
    })
  }

  if (isRecipeItem(item)) {
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

  if (isGroupItem(item)) {
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
