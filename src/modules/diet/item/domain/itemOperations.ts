import { type Item } from '~/modules/diet/item/domain/item'

/**
 * Pure functions for item operations
 * Replaces the deprecated ItemEditor pattern
 */

export function updateItemQuantity(item: Item, quantity: number): Item {
  return {
    ...item,
    quantity,
  }
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
