import { describe, expect, it } from 'vitest'

import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  isFood,
  isGroup,
  isRecipe,
  UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { parseWithStack } from '~/shared/utils/parseWithStack'

describe('unifiedItemSchema', () => {
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
  it('isFood, isRecipe, isGroup work as expected', () => {
    expect(isFood(unifiedFood)).toBe(true)
    expect(isGroup(unifiedGroup)).toBe(true)
    expect(isRecipe(unifiedFood)).toBe(false)
  })
})
