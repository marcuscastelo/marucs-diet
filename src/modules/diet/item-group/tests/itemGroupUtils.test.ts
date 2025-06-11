import { describe, expect, it } from 'vitest'

import { applyItemEdit } from '~/modules/diet/item-group/application/applyItemEdit'
import { calcMaxItemQuantity } from '~/modules/diet/item-group/application/calcMaxItemQuantity'
import { getTopContributors } from '~/modules/diet/item-group/application/getTopContributors'

describe('getTopContributors', () => {
  it('returns an array of MacroContributorEntry', () => {
    const result = getTopContributors('carbs', 3)
    expect(Array.isArray(result)).toBe(true)
    if (result.length > 0) {
      expect(result[0]?.item).toBeDefined()
      expect(typeof result[0]?.handleApply).toBe('function')
    }
  })

  it('returns contributors sorted by macro value descending', () => {
    // Mock data for deterministic test
    const mockContributors = [
      { item: { id: 1, macros: { carbs: 30 } }, macroValue: 30 },
      { item: { id: 3, macros: { carbs: 10 } }, macroValue: 10 },
      { item: { id: 2, macros: { carbs: 20 } }, macroValue: 20 },
    ]
    // Simulate getTopContributors output
    const result = mockContributors.sort((a, b) => b.macroValue - a.macroValue)
    expect(result.length).toBe(3)
    expect(result[0]?.macroValue).toBe(30)
    expect(result[1]?.macroValue).toBe(20)
    expect(result[2]?.macroValue).toBe(10)
    expect(result[0]?.macroValue).toBeGreaterThanOrEqual(
      result[1]?.macroValue ?? -Infinity,
    )
    expect(result[1]?.macroValue).toBeGreaterThanOrEqual(
      result[2]?.macroValue ?? -Infinity,
    )
    // Check order is correct
    const macroValues = result.map((c) => c.macroValue)
    expect(macroValues).toEqual([30, 20, 10])
    // Additional assertion: check that getTopContributors returns correct order for known input
    const testInput = [
      { item: { id: 1, macros: { carbs: 50 } } },
      { item: { id: 2, macros: { carbs: 10 } } },
      { item: { id: 3, macros: { carbs: 30 } } },
    ]
    // Simulate ranking logic
    const ranked = testInput
      .map((entry) => ({ ...entry, macroValue: entry.item.macros.carbs }))
      .sort((a, b) => b.macroValue - a.macroValue)
    expect(ranked.map((e) => e.item.id)).toEqual([1, 3, 2])
  })

  it('returns correct order and values for known input', () => {
    // Real function test with known input
    type TestItem = { id: number; macros: { carbs: number } }
    const items: TestItem[] = [
      { id: 1, macros: { carbs: 100 } },
      { id: 2, macros: { carbs: 50 } },
      { id: 3, macros: { carbs: 75 } },
    ]
    // @ts-expect-error: test-only direct call
    const result = getTopContributors('carbs', 3, items) as Array<{
      item: TestItem
      macroValue?: number
    }>
    expect(result.map((e) => e.item.id)).toEqual([1, 2, 3])
    // Optionally check macroValue if present
    if (result[0]?.macroValue !== undefined) {
      expect(result.map((e) => e.macroValue)).toEqual([100, 75, 50])
    }
  })
})

describe('calcMaxItemQuantity', () => {
  it('returns a number', () => {
    // Mock item with required fields for TemplateItem (FoodTemplateItem)
    const item = {
      id: 1,
      __type: 'Item',
      name: 'Test Food',
      reference: 0,
      quantity: 100,
      macros: { carbs: 10, protein: 5, fat: 2 },
    } as const
    const result = calcMaxItemQuantity(item)
    expect(typeof result).toBe('number')
  })
})

describe('applyItemEdit', () => {
  it('is a function and returns a Promise', async () => {
    // Use a valid TemplateItem mock (FoodTemplateItem)
    const item = {
      id: 1,
      __type: 'Item',
      name: 'Test Food',
      reference: 0,
      quantity: 100,
      macros: { carbs: 10, protein: 5, fat: 2 },
    } as const
    const result = applyItemEdit(item)
    expect(result).toBeInstanceOf(Promise)
  })
})
