import { describe, expect, it } from 'vitest'

import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  findItemById,
  flattenItemTree,
  getItemDepth,
} from '~/modules/diet/unified-item/domain/treeUtils'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('treeUtils', () => {
  const unifiedFood: UnifiedItem = createUnifiedItem({
    id: 1,
    name: 'Chicken',
    quantity: 100,
    reference: {
      type: 'food',
      id: 10,
      macros: createMacroNutrients({ protein: 20, carbs: 0, fat: 2 }),
    },
  })
  const unifiedGroup: UnifiedItem = createUnifiedItem({
    id: 2,
    name: 'Lunch',
    quantity: 100,
    reference: { type: 'group', children: [unifiedFood] },
  })
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
