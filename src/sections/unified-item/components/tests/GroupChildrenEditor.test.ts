import { describe, expect, it } from 'vitest'

import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('GroupChildrenEditor', () => {
  it('should handle group items with children', () => {
    const groupItem = createUnifiedItem({
      id: 1,
      name: 'Test Group',
      quantity: 1,
      reference: {
        type: 'group',
        children: [
          createUnifiedItem({
            id: 2,
            name: 'Child Food',
            quantity: 100,
            reference: {
              type: 'food',
              id: 10,
              macros: { carbs: 20, protein: 5, fat: 2 },
            },
          }),
        ],
      },
    })

    // This test validates the structure of group items
    expect(groupItem.reference.type).toBe('group')
    if (groupItem.reference.type === 'group') {
      expect(groupItem.reference.children).toHaveLength(1)
      expect(groupItem.reference.children[0]?.name).toBe('Child Food')
    }
  })

  it('should handle empty groups', () => {
    const emptyGroup = createUnifiedItem({
      id: 1,
      name: 'Empty Group',
      quantity: 1,
      reference: {
        type: 'group',
        children: [],
      },
    })

    // This test validates the structure of empty groups
    expect(emptyGroup.reference.type).toBe('group')
    if (emptyGroup.reference.type === 'group') {
      expect(emptyGroup.reference.children).toHaveLength(0)
    }
    expect(emptyGroup.name).toBe('Empty Group')
  })
})
