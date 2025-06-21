import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Updates the name of a UnifiedItem
 */
export function updateUnifiedItemName(
  item: UnifiedItem,
  newName: string,
): UnifiedItem {
  return {
    ...item,
    name: newName,
  }
}
