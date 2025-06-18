import { describe, expect, it } from 'vitest'

import {
  isFood,
  isGroup,
  isRecipe,
  UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { parseWithStack } from '~/shared/utils/parseWithStack'

describe('unifiedItemSchema', () => {
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
  it('isFood, isRecipe, isGroup work as expected', () => {
    expect(isFood(unifiedFood)).toBe(true)
    expect(isGroup(unifiedGroup)).toBe(true)
    expect(isRecipe(unifiedFood)).toBe(false)
  })
})
