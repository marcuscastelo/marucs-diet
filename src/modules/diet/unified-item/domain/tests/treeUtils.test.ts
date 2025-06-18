import { describe, expect, it } from 'vitest'

import {
  findItemById,
  flattenItemTree,
  getItemDepth,
} from '~/modules/diet/unified-item/domain/treeUtils'
import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('treeUtils', () => {
  const unifiedFood: UnifiedItem = {
    id: 1,
    name: 'Chicken',
    quantity: 100,
    macros: { protein: 20, carbs: 0, fat: 2 },
    reference: { type: 'food', id: 10 },
    __type: 'UnifiedItem',
  }
  const unifiedGroup: UnifiedItem = {
    id: 2,
    name: 'Lunch',
    quantity: 100,
    macros: { protein: 20, carbs: 0, fat: 2 },
    reference: { type: 'group', children: [unifiedFood] },
    __type: 'UnifiedItem',
  }
  it('flattens item tree', () => {
    const flat = flattenItemTree(unifiedGroup)
    expect(flat.length).toBe(2)
  })
  it('gets item depth', () => {
    expect(getItemDepth(unifiedGroup)).toBe(2)
    expect(getItemDepth(unifiedFood)).toBe(1)
  })
  it('finds item by id', () => {
    expect(findItemById(unifiedGroup, 1)).toMatchObject(unifiedFood)
    expect(findItemById(unifiedGroup, 999)).toBeUndefined()
  })
})
