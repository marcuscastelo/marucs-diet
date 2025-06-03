import {
  updateItemQuantity,
  updateItemName,
  updateItemMacros,
  replaceItem,
} from './itemOperations'
import { describe, it, expect } from 'vitest'

const baseItem = {
  id: 1,
  __type: 'Item',
  name: 'Arroz',
  reference: 1,
  quantity: 100,
  macros: { carbs: 10, protein: 2, fat: 1 },
} as const

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
