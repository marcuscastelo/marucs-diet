import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

type ProtoUnifiedItem = Omit<UnifiedItem, '__type'>

/**
 * Validates that the UnifiedItem hierarchy does not contain circular references.
 * @param item UnifiedItem
 * @param visited Set of visited item ids
 * @returns boolean
 */
export function validateItemHierarchy(
  item: ProtoUnifiedItem,
  visited: Set<number> = new Set(),
): boolean {
  if (typeof item.id !== 'number') return false
  if (visited.has(item.id)) return false
  visited.add(item.id)
  if (
    (item.reference.type === 'recipe' || item.reference.type === 'group') &&
    Array.isArray(item.reference.children)
  ) {
    for (const child of item.reference.children) {
      if (!validateItemHierarchy(child, visited)) return false
    }
  }
  visited.delete(item.id)
  return true
}
