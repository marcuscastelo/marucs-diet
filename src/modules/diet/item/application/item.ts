import { type Item } from '~/modules/diet/item/domain/item'

/**
 * Pure functions for item operations
 * Replaces the deprecated ItemEditor pattern
 */

/**
 * Updates the quantity of an item
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
