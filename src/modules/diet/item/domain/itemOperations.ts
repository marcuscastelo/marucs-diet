import { type Item } from '~/modules/diet/item/domain/item'
import {
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'

/**
 * Pure functions for item operations
 */

export function updateItemQuantity(item: Item, quantity: number): Item {
  // Convert Item to UnifiedItem, update quantity, convert back
  const unified = itemToUnifiedItem(item)
  const updatedUnified = { ...unified, quantity }
  return unifiedItemToItem(updatedUnified)
}

export function updateItemName(item: Item, name: string): Item {
  return {
    ...item,
    name,
  }
}

export function updateItemMacros(item: Item, macros: Item['macros']): Item {
  return {
    ...item,
    macros,
  }
}

export function replaceItem(item: Item, updates: Partial<Item>): Item {
  return {
    ...item,
    ...updates,
  }
}
