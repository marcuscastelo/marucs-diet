import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'

/**
 * Checks if the provided data is a clipboard Item.
 * @param data - The data to check
 * @returns True if data is an Item
 */
export function isClipboardItem(
  data: unknown,
): data is z.infer<typeof itemSchema> {
  return (
    typeof data === 'object' &&
    data !== null &&
    '__type' in data &&
    (data as { __type?: string }).__type === 'Item' &&
    'id' in data &&
    'name' in data &&
    'reference' in data &&
    'quantity' in data &&
    'macros' in data
  )
}

/**
 * Checks if the provided data is a clipboard ItemGroup.
 * @param data - The data to check
 * @returns True if data is an ItemGroup
 */
export function isClipboardItemGroup(
  data: unknown,
): data is z.infer<typeof itemGroupSchema> {
  return (
    typeof data === 'object' &&
    data !== null &&
    '__type' in data &&
    (data as { __type?: string }).__type === 'ItemGroup' &&
    'items' in data &&
    Array.isArray((data as { items?: unknown[] }).items)
  )
}
