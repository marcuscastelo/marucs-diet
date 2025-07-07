import { describe, expect, it } from 'vitest'

import { validateItemHierarchy } from '~/modules/diet/unified-item/domain/validateItemHierarchy'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('validateItemHierarchy', () => {
  const unifiedFood: UnifiedItem = createUnifiedItem({
    id: 1,
    name: 'Chicken',
    quantity: 100,
    reference: {
      type: 'food',
      id: 10,
      macros: { protein: 20, carbs: 0, fat: 2 },
    },
  })
  const unifiedGroup: UnifiedItem = createUnifiedItem({
    id: 2,
    name: 'Lunch',
    quantity: 100,
    reference: { type: 'group', children: [unifiedFood] },
  })
  it('validates non-circular hierarchy', () => {
    expect(validateItemHierarchy(unifiedGroup)).toBe(true)
  })
  it('detects circular references', () => {
    const circular: UnifiedItem = {
      ...unifiedGroup,
      reference: { type: 'group', children: [unifiedGroup] },
    }
    expect(validateItemHierarchy(circular)).toBe(false)
  })
})
