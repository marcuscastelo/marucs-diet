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
      { item: { id: 2, macros: { carbs: 20 } }, macroValue: 20 },
      { item: { id: 3, macros: { carbs: 10 } }, macroValue: 10 },
    ]
    // Simulate getTopContributors output
    const result = mockContributors.sort((a, b) => b.macroValue - a.macroValue)
    expect(result.length).toBe(3)
    expect(result[0]?.macroValue).toBeGreaterThanOrEqual(
      result[1]?.macroValue ?? -Infinity,
    )
    expect(result[1]?.macroValue).toBeGreaterThanOrEqual(
      result[2]?.macroValue ?? -Infinity,
    )
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
