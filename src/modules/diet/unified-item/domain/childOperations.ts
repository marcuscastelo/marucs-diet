import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

type ProtoUnifiedItem = Omit<UnifiedItem, '__type'>

function toUnifiedItem(item: ProtoUnifiedItem): UnifiedItem {
  return { ...item, __type: 'UnifiedItem' }
}

/**
 * Adds a child to a UnifiedItem (recipe or group).
 * @param item ProtoUnifiedItem
 * @param child ProtoUnifiedItem
 * @returns ProtoUnifiedItem
 */
export function addChildToItem(
  item: ProtoUnifiedItem,
  child: ProtoUnifiedItem,
): ProtoUnifiedItem {
  if (
    (item.reference.type === 'recipe' || item.reference.type === 'group') &&
    Array.isArray(item.reference.children)
  ) {
    return {
      ...item,
      reference: {
        ...item.reference,
        children: [...item.reference.children, toUnifiedItem(child)],
      },
    }
  }
  return item
}

/**
 * Removes a child by id from a UnifiedItem (recipe or group).
 * @param item ProtoUnifiedItem
 * @param childId number
 * @returns ProtoUnifiedItem
 */
export function removeChildFromItem(
  item: ProtoUnifiedItem,
  childId: number,
): ProtoUnifiedItem {
  if (
    (item.reference.type === 'recipe' || item.reference.type === 'group') &&
    Array.isArray(item.reference.children)
  ) {
    return {
      ...item,
      reference: {
        ...item.reference,
        children: item.reference.children.filter((c) => c.id !== childId),
      },
    }
  }
  return item
}

/**
 * Updates a child by id in a UnifiedItem (recipe or group).
 * @param item ProtoUnifiedItem
 * @param childId number
 * @param updates Partial<ProtoUnifiedItem>
 * @returns ProtoUnifiedItem
 */
export function updateChildInItem(
  item: ProtoUnifiedItem,
  childId: number,
  updates: Partial<ProtoUnifiedItem>,
): ProtoUnifiedItem {
  if (
    (item.reference.type === 'recipe' || item.reference.type === 'group') &&
    Array.isArray(item.reference.children)
  ) {
    return {
      ...item,
      reference: {
        ...item.reference,
        children: item.reference.children.map((c) =>
          c.id === childId ? { ...c, ...updates, __type: 'UnifiedItem' } : c,
        ),
      },
    }
  }
  return item
}

/**
 * Moves a child from one UnifiedItem to another.
 * @param source ProtoUnifiedItem
 * @param target ProtoUnifiedItem
 * @param childId number
 * @returns { source: ProtoUnifiedItem, target: ProtoUnifiedItem }
 */
export function moveChildBetweenItems(
  source: ProtoUnifiedItem,
  target: ProtoUnifiedItem,
  childId: number,
): { source: ProtoUnifiedItem; target: ProtoUnifiedItem } {
  const child =
    (source.reference.type === 'recipe' || source.reference.type === 'group') &&
    Array.isArray(source.reference.children)
      ? source.reference.children.find((c) => c.id === childId)
      : undefined
  if (!child) return { source, target }
  const newSource = removeChildFromItem(source, childId)
  const newTarget = addChildToItem(target, child)
  return { source: newSource, target: newTarget }
}
