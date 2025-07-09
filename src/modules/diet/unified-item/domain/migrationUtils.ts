import { createItem, type Item } from '~/modules/diet/item/domain/item'
import {
  createRecipedItemGroup,
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
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
 * @deprecated
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
 * @deprecated
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
      const item = createItem({
        name: u.name,
        reference: u.reference.id,
        quantity: u.quantity,
        macros: u.reference.macros,
      })
      items.push({ ...item, id: u.id })
    } else if (u.reference.type === 'group') {
      const itemsForGroup = u.reference.children.map((c) => {
        if (c.reference.type !== 'food') {
          throw new Error(
            `migrateFromUnifiedItems: Only food children are supported in group.items. Found type: ${c.reference.type} (id: ${c.id})`,
          )
        }
        const childItem = createItem({
          name: c.name,
          reference: c.reference.id,
          quantity: c.quantity,
          macros: c.reference.macros,
        })
        return { ...childItem, id: c.id }
      })

      const group = createSimpleItemGroup({
        name: u.name,
        items: itemsForGroup,
      })
      groups.push({ ...group, id: u.id })
    } else {
      // Recipe case (u.reference.type === 'recipe')
      const itemsForRecipe = u.reference.children.map((c) => {
        if (c.reference.type !== 'food') {
          throw new Error(
            `migrateFromUnifiedItems: Only food children are supported in recipe.items. Found type: ${c.reference.type} (id: ${c.id})`,
          )
        }
        const childItem = createItem({
          name: c.name,
          reference: c.reference.id,
          quantity: c.quantity,
          macros: c.reference.macros,
        })
        return { ...childItem, id: c.id }
      })

      const group = createRecipedItemGroup({
        name: u.name,
        items: itemsForRecipe,
        recipe: u.reference.id,
      })
      groups.push({ ...group, id: u.id })
    }
  }

  return { items, groups }
}
