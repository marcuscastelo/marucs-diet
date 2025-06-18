import { describe, expect, it } from 'vitest'

import type { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  addChildToItem,
  moveChildBetweenItems,
  removeChildFromItem,
  updateChildInItem,
} from '~/modules/diet/unified-item/domain/childOperations'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  migrateFromUnifiedItems,
  migrateToUnifiedItems,
} from '~/modules/diet/unified-item/domain/migrationUtils'
import {
  findItemById,
  flattenItemTree,
  getItemDepth,
} from '~/modules/diet/unified-item/domain/treeUtils'
import { validateItemHierarchy } from '~/modules/diet/unified-item/domain/validateItemHierarchy'
import {
  isFood,
  isGroup,
  isRecipe,
  type UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const sampleItem: Item = {
  id: 1,
  name: 'Chicken',
  quantity: 100,
  macros: { protein: 20, carbs: 0, fat: 2 },
  reference: 10,
  __type: 'Item',
}
const sampleGroup: ItemGroup = {
  id: 2,
  name: 'Lunch',
  items: [sampleItem],
  recipe: 1,
  __type: 'ItemGroup',
}
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

describe('unifiedItemSchema', () => {
  it('validates a valid UnifiedItem', () => {
    expect(() => parseWithStack(unifiedItemSchema, unifiedFood)).not.toThrow()
    expect(() => parseWithStack(unifiedItemSchema, unifiedGroup)).not.toThrow()
  })
  it('rejects invalid UnifiedItem', () => {
    expect(() =>
      parseWithStack(unifiedItemSchema, { ...unifiedFood, id: 'bad' }),
    ).toThrow()
  })
})

describe('type guards', () => {
  it('isFood, isRecipe, isGroup work as expected', () => {
    expect(isFood(unifiedFood)).toBe(true)
    expect(isGroup(unifiedGroup)).toBe(true)
    expect(isRecipe(unifiedFood)).toBe(false)
  })
})

describe('conversionUtils', () => {
  it('itemToUnifiedItem and unifiedItemToItem are inverse', () => {
    const unified = itemToUnifiedItem(sampleItem)
    // Compare only the fields present in ProtoUnifiedItem (no __type)
    expect(unified).toMatchObject({
      id: unifiedFood.id,
      name: unifiedFood.name,
      quantity: unifiedFood.quantity,
      macros: unifiedFood.macros,
      reference: unifiedFood.reference,
    })
    const item = unifiedItemToItem(unified)
    expect(item).toMatchObject(sampleItem)
  })
  it('itemGroupToUnifiedItem converts group', () => {
    const groupUnified = itemGroupToUnifiedItem(sampleGroup)
    expect(groupUnified.reference.type).toBe('group')
    if (groupUnified.reference.type === 'group') {
      expect(Array.isArray(groupUnified.reference.children)).toBe(true)
    }
  })
})

describe('migrationUtils', () => {
  it('migrates items and groups to unified and back', () => {
    const unified = migrateToUnifiedItems([sampleItem], [sampleGroup])
    expect(unified.length).toBe(2)
    const { items, groups } = migrateFromUnifiedItems(unified)
    expect(items.length).toBe(1)
    expect(groups.length).toBe(1)
  })
})

describe('treeUtils', () => {
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

describe('validateItemHierarchy', () => {
  it('validates non-circular hierarchy', () => {
    expect(validateItemHierarchy(unifiedGroup)).toBe(true)
  })
  it('detects circular references', () => {
    // Create a circular reference
    const circular: UnifiedItem = {
      ...unifiedGroup,
      reference: { type: 'group', children: [unifiedGroup] },
    }
    expect(validateItemHierarchy(circular)).toBe(false)
  })
})

describe('childOperations', () => {
  const childA = {
    id: 11,
    name: 'A',
    quantity: 1,
    macros: { protein: 1, carbs: 1, fat: 1 },
    reference: { type: 'food', id: 100 },
    __type: 'UnifiedItem',
  } as const
  const childB = {
    id: 12,
    name: 'B',
    quantity: 2,
    macros: { protein: 2, carbs: 2, fat: 2 },
    reference: { type: 'food', id: 101 },
    __type: 'UnifiedItem',
  } as const
  const baseGroup = {
    id: 10,
    name: 'Group',
    quantity: 1,
    macros: { protein: 0, carbs: 0, fat: 0 },
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
