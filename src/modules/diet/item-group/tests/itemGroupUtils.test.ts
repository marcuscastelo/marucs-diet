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
