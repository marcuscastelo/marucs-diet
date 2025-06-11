import { describe, it, expect } from 'vitest'
import { getTopContributors } from '../application/getTopContributors'
import { applyItemEdit } from '../application/applyItemEdit'
import { calcMaxItemQuantity } from '../application/calcMaxItemQuantity'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

describe('getTopContributors', () => {
  it('returns an array of MacroContributorEntry', () => {
    const result = getTopContributors('carbs', 3)
    expect(Array.isArray(result)).toBe(true)
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('item')
      expect(typeof result[0].handleApply).toBe('function')
    }
  })
})

describe('calcMaxItemQuantity', () => {
  it('returns a number', () => {
    // Mock item with required fields
    const item = { id: 1, __type: 'food', quantity: 100 } as TemplateItem
    const result = calcMaxItemQuantity(item)
    expect(typeof result).toBe('number')
  })
})

describe('applyItemEdit', () => {
  it('is a function and returns a Promise', async () => {
    const item = { id: 1, __type: 'food', quantity: 100 } as TemplateItem
    const result = applyItemEdit(item)
    expect(result).toBeInstanceOf(Promise)
  })
})
