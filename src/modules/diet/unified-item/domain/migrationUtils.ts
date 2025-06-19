import { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Migrates an array of Items and ItemGroups to UnifiedItems.
 * Strategy:
 * - For recipes: never flatten, always preserve structure
 * - For groups: flatten only if exactly 1 item, otherwise preserve as group
 * @param items Item[]
 * @param groups ItemGroup[]
 * @returns UnifiedItem[]
 */
export function migrateToUnifiedItems(
  items: Item[],
  groups: ItemGroup[],
): UnifiedItem[] {
  const unifiedItems: UnifiedItem[] = []

  // Convert individual items
  unifiedItems.push(...items.map((item) => itemToUnifiedItem(item)))

  // Process groups with flattening strategy
  for (const group of groups) {
    if (group.recipe !== undefined) {
      // For recipes: never flatten, always preserve structure
      unifiedItems.push(itemGroupToUnifiedItem(group))
    } else {
      // For groups: flatten only if exactly 1 item
      if (group.items.length === 1) {
        // Flatten single-item groups
        unifiedItems.push(...group.items.map((item) => itemToUnifiedItem(item)))
      } else {
        // Preserve empty groups and multi-item groups
        unifiedItems.push(itemGroupToUnifiedItem(group))
      }
    }
  }

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
        macros: u.reference.macros,
        reference: u.reference.id,
        __type: 'Item',
      })
    } else if (u.reference.type === 'group') {
      groups.push({
        id: u.id,
        name: u.name,
        items: u.reference.children.map((c) => {
          if (c.reference.type !== 'food') {
            throw new Error(
              `migrateFromUnifiedItems: Only food children are supported in group.items. Found type: ${c.reference.type} (id: ${c.id})`,
            )
          }
          return {
            id: c.id,
            name: c.name,
            quantity: c.quantity,
            macros: c.reference.macros,
            reference: c.reference.id,
            __type: 'Item',
          }
        }),
        recipe: undefined,
        __type: 'ItemGroup',
      })
    } else {
      // Recipe case (u.reference.type === 'recipe')
      groups.push({
        id: u.id,
        name: u.name,
        items: u.reference.children.map((c) => {
          if (c.reference.type !== 'food') {
            throw new Error(
              `migrateFromUnifiedItems: Only food children are supported in recipe.items. Found type: ${c.reference.type} (id: ${c.id})`,
            )
          }
          return {
            id: c.id,
            name: c.name,
            quantity: c.quantity,
            macros: c.reference.macros,
            reference: c.reference.id,
            __type: 'Item',
          }
        }),
        recipe: u.reference.id,
        __type: 'ItemGroup',
      })
    }
  }
  return { items, groups }
}
