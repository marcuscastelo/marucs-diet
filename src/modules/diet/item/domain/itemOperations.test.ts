import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import {
  replaceItem,
  updateItemMacros,
  updateItemName,
  updateItemQuantity,
} from '~/modules/diet/item/domain/itemOperations'

const baseItem = createItem({
  id: 1,
  name: 'Arroz',
  reference: 1,
  quantity: 100,
  macros: { carbs: 10, protein: 2, fat: 1 },
})

describe('itemOperations', () => {
  it('updateItemQuantity updates quantity', () => {
    const result = updateItemQuantity(baseItem, 200)
    expect(result.quantity).toBe(200)
  })

  it('updateItemName updates name', () => {
    const result = updateItemName(baseItem, 'Feijão')
    expect(result.name).toBe('Feijão')
  })

  it('updateItemMacros updates macros', () => {
    const macros = { carbs: 20, protein: 5, fat: 2 }
    const result = updateItemMacros(baseItem, macros)
    expect(result.macros).toEqual(macros)
  })

  it('replaceItem replaces fields', () => {
    const result = replaceItem(baseItem, { name: 'Novo', quantity: 50 })
    expect(result.name).toBe('Novo')
    expect(result.quantity).toBe(50)
  })
})
