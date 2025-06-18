import { z } from 'zod'

import { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { getItemGroupQuantity } from '~/modules/diet/item-group/domain/itemGroup'
import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Converts an Item to a UnifiedItem (food reference).
 * @param item Item
 * @returns UnifiedItem
 */
export function itemToUnifiedItem(item: Item): UnifiedItem {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    macros: item.macros,
    reference: { type: 'food', id: item.reference },
    __type: 'UnifiedItem',
  }
}

/**
 * Converts a UnifiedItem (food reference) to an Item.
 * @param unified UnifiedItem
 * @returns Item
 */
export function unifiedItemToItem(unified: UnifiedItem): Item {
  if (unified.reference.type !== 'food') throw new Error('Not a food reference')
  return {
    id: unified.id,
    name: unified.name,
    quantity: unified.quantity,
    macros: unified.macros,
    reference: unified.reference.id,
    __type: 'Item',
  }
}

/**
 * Converts a SimpleItemGroup or RecipedItemGroup to a UnifiedItem (group reference).
 * @param group ItemGroup
 * @returns UnifiedItem
 */
export function itemGroupToUnifiedItem(group: ItemGroup): UnifiedItem {
  return {
    id: group.id,
    name: group.name,
    quantity: getItemGroupQuantity(group),
    macros: group.items
      .map((i) => i.macros)
      .reduce(
        (acc, macros) => ({
          protein: acc.protein + macros.protein,
          carbs: acc.carbs + macros.carbs,
          fat: acc.fat + macros.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 },
      ),
    reference: {
      type: 'group',
      children: group.items.map((item) => itemToUnifiedItem(item)),
    },
    __type: 'UnifiedItem',
  }
}
