import { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Migrates an array of Items and ItemGroups to UnifiedItems.
 * @param items Item[]
 * @param groups ItemGroup[]
 * @returns UnifiedItem[]
 */
export function migrateToUnifiedItems(
  items: Item[],
  groups: ItemGroup[],
): UnifiedItem[] {
  const unifiedItems = [
    ...items.map((item) => ({
      ...itemToUnifiedItem(item),
      __type: 'UnifiedItem' as const,
    })),
    ...groups.map((group) => ({
      ...itemGroupToUnifiedItem(group),
      __type: 'UnifiedItem' as const,
    })),
  ]
  return unifiedItems
}

/**
 * Migrates UnifiedItems back to Items and ItemGroups (legacy compatibility).
 * Only supports flat UnifiedItems (no nested children).
 * @param unified UnifiedItem[]
 * @returns { items: Item[], groups: ItemGroup[] }
 */
export function migrateFromUnifiedItems(unified: UnifiedItem[]): {
  items: Item[]
  groups: ItemGroup[]
} {
  const items: Item[] = []
  const groups: ItemGroup[] = []
  for (const u of unified) {
    if (u.reference.type === 'food') {
      items.push({
        id: u.id,
        name: u.name,
        quantity: u.quantity,
        macros: u.macros,
        reference: u.reference.id,
        __type: 'Item',
      })
    } else if (u.reference.type === 'group') {
      groups.push({
        id: u.id,
        name: u.name,
        items: u.reference.children.map((c) => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          macros: c.macros,
          reference: c.reference.type === 'food' ? c.reference.id : 0,
          __type: 'Item',
        })),
        recipe: undefined,
        __type: 'ItemGroup',
      })
    }
  }
  return { items, groups }
}
