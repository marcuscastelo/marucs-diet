import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

type ProtoUnifiedItem = Omit<UnifiedItem, '__type'>

/**
 * Flattens the UnifiedItem tree into a flat array of all descendants (including self).
 * @param item ProtoUnifiedItem
 * @returns ProtoUnifiedItem[]
 */
export function flattenItemTree(item: ProtoUnifiedItem): ProtoUnifiedItem[] {
  const result: ProtoUnifiedItem[] = [item]
  if (
    (item.reference.type === 'recipe' || item.reference.type === 'group') &&
    Array.isArray(item.reference.children)
  ) {
    for (const child of item.reference.children) {
      result.push(...flattenItemTree(child))
    }
  }
  return result
}

/**
 * Returns the depth of the UnifiedItem hierarchy (root = 1).
 * @param item ProtoUnifiedItem
 * @returns number
 */
export function getItemDepth(item: ProtoUnifiedItem): number {
  if (
    (item.reference.type === 'recipe' || item.reference.type === 'group') &&
    Array.isArray(item.reference.children) &&
    item.reference.children.length > 0
  ) {
    return 1 + Math.max(...item.reference.children.map(getItemDepth))
  }
  return 1
}

/**
 * Recursively searches for an item by id in the UnifiedItem tree.
 * @param root ProtoUnifiedItem
 * @param id number
 * @returns ProtoUnifiedItem | undefined
 */
export function findItemById(
  root: ProtoUnifiedItem,
  id: number,
): ProtoUnifiedItem | undefined {
  if (root.id === id) return root
  if (
    (root.reference.type === 'recipe' || root.reference.type === 'group') &&
    Array.isArray(root.reference.children)
  ) {
    for (const child of root.reference.children) {
      const found = findItemById(child, id)
      if (found) return found
    }
  }
  return undefined
}
