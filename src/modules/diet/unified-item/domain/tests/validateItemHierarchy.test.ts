import { describe, expect, it } from 'vitest'

import { validateItemHierarchy } from '~/modules/diet/unified-item/domain/validateItemHierarchy'
import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('validateItemHierarchy', () => {
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
