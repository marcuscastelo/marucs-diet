import { describe, expect, it } from 'vitest'

import { ItemEditor } from './itemEditor'
import { type Item } from '~/modules/diet/food-item/domain/foodItem'

function mockItem(): Item {
  return {
    name: 'test:name',
    reference: 1,
    macros: {
      carbs: 10,
      fat: 20,
      protein: 30,
    },
    __type: 'Item',
    id: 1000,
    quantity: 11234,
  }
}

describe('ItemEditor', () => {
  it('should give the same item if no changes were made', () => {
    expect(new ItemEditor(mockItem()).finish()).toEqual(mockItem())
  })

  it('should set quantity', () => {
    expect(new ItemEditor(mockItem()).setQuantity(100).finish()).toHaveProperty(
      'quantity',
      100,
    )
  })
})
