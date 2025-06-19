import { describe, expect, it } from 'vitest'

import {
  addChildToItem,
  moveChildBetweenItems,
  removeChildFromItem,
  updateChildInItem,
} from '~/modules/diet/unified-item/domain/childOperations'
import { UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

describe('childOperations', () => {
  const childA = {
    id: 11,
    name: 'A',
    quantity: 1,
    reference: {
      type: 'food',
      id: 100,
      macros: { protein: 1, carbs: 1, fat: 1 },
    },
    __type: 'UnifiedItem',
  } as const
  const childB = {
    id: 12,
    name: 'B',
    quantity: 2,
    reference: {
      type: 'food',
      id: 101,
      macros: { protein: 2, carbs: 2, fat: 2 },
    },
    __type: 'UnifiedItem',
  } as const
  const baseGroup = {
    id: 10,
    name: 'Group',
    quantity: 1,
    reference: { type: 'group', children: [] as UnifiedItem[] },
    __type: 'UnifiedItem',
  } as const
  it('addChildToItem adds a child', () => {
    const group = {
      ...baseGroup,
      reference: { ...baseGroup.reference, children: [] },
    }
    const updated = addChildToItem(group, childA)
    expect(updated.reference.type).toBe('group')
    if (updated.reference.type === 'group') {
      expect(updated.reference.children.length).toBe(1)
      expect(updated.reference.children[0]?.id).toBe(childA.id)
    }
  })
  it('removeChildFromItem removes a child by id', () => {
    const group = {
      ...baseGroup,
      reference: { ...baseGroup.reference, children: [childA, childB] },
    }
    const updated = removeChildFromItem(group, childA.id)
    expect(updated.reference.type).toBe('group')
    if (updated.reference.type === 'group') {
      expect(updated.reference.children.length).toBe(1)
      expect(updated.reference.children[0]?.id).toBe(childB.id)
    }
  })
  it('updateChildInItem updates a child by id', () => {
    const group = {
      ...baseGroup,
      reference: { ...baseGroup.reference, children: [childA] },
    }
    const updated = updateChildInItem(group, childA.id, { name: 'Updated' })
    expect(updated.reference.type).toBe('group')
    if (updated.reference.type === 'group') {
      expect(updated.reference.children[0]?.name).toBe('Updated')
    }
  })
  it('moveChildBetweenItems moves a child from one group to another', () => {
    const group1 = {
      ...baseGroup,
      id: 1,
      reference: { ...baseGroup.reference, children: [childA] },
    }
    const group2 = {
      ...baseGroup,
      id: 2,
      reference: { ...baseGroup.reference, children: [] },
    }
    const { source, target } = moveChildBetweenItems(group1, group2, childA.id)
    expect(source.reference.type).toBe('group')
    expect(target.reference.type).toBe('group')
    if (
      source.reference.type === 'group' &&
      target.reference.type === 'group'
    ) {
      expect(source.reference.children.length).toBe(0)
      expect(target.reference.children.length).toBe(1)
      expect(target.reference.children[0]?.id).toBe(childA.id)
    }
  })
})
