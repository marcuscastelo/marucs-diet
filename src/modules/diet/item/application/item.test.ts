import { describe, expect, it } from 'vitest'

import {
  convertItemToUnified,
  convertUnifiedToItem,
  updateUnifiedItemName,
  updateUnifiedItemQuantity,
} from '~/modules/diet/item/application/item'
import { createItem } from '~/modules/diet/item/domain/item'
import { calcUnifiedItemMacros } from '~/shared/utils/macroMath'

describe('item application services', () => {
  const baseItem = {
    ...createItem({
      name: 'Arroz',
      reference: 1,
      quantity: 100,
      macros: { carbs: 10, protein: 2, fat: 1 },
    }),
    id: 1,
  }

  const baseUnifiedItem = {
    id: 1,
    name: 'Arroz',
    quantity: 100,
    macros: { carbs: 10, protein: 2, fat: 1 },
    reference: { type: 'food' as const, id: 1 },
    __type: 'UnifiedItem' as const,
  }

  describe('updateUnifiedItemQuantity', () => {
    it('updates the quantity of a unified item', () => {
      const result = updateUnifiedItemQuantity(baseUnifiedItem, 200)
      expect(result.quantity).toBe(200)
      expect(result.name).toBe(baseUnifiedItem.name)
      // Macros should scale proportionally with quantity
      expect(calcUnifiedItemMacros(result)).toEqual({
        carbs: 20, // (10 * 200) / 100
        fat: 2, // (1 * 200) / 100
        protein: 4, // (2 * 200) / 100
      })
    })
  })

  describe('updateUnifiedItemName', () => {
    it('updates the name of a unified item', () => {
      const result = updateUnifiedItemName(baseUnifiedItem, 'Arroz Integral')
      expect(result.name).toBe('Arroz Integral')
      expect(result.quantity).toBe(baseUnifiedItem.quantity)
      expect(calcUnifiedItemMacros(result)).toEqual(
        calcUnifiedItemMacros(baseUnifiedItem),
      )
    })
  })

  describe('convertItemToUnified', () => {
    it('converts a legacy item to unified item', () => {
      const result = convertItemToUnified(baseItem)
      expect(result.id).toBe(baseItem.id)
      expect(result.name).toBe(baseItem.name)
      expect(result.quantity).toBe(baseItem.quantity)
      expect(calcUnifiedItemMacros(result)).toEqual(baseItem.macros)
      expect(result.reference).toEqual({ type: 'food', id: baseItem.reference })
      expect(result.__type).toBe('UnifiedItem')
    })
  })

  describe('convertUnifiedToItem', () => {
    it('converts a unified item back to legacy item', () => {
      const result = convertUnifiedToItem(baseUnifiedItem)
      expect(result.id).toBe(baseUnifiedItem.id)
      expect(result.name).toBe(baseUnifiedItem.name)
      expect(result.quantity).toBe(baseUnifiedItem.quantity)
      expect(result.macros).toEqual(baseUnifiedItem.macros)
      expect(result.reference).toBe(1)
      expect(result.__type).toBe('Item')
    })

    it('converts non-food reference types to items with zero macros', () => {
      const recipeUnifiedItem = {
        ...baseUnifiedItem,
        reference: { type: 'recipe' as const, id: 1, children: [] },
      }
      const result = convertUnifiedToItem(recipeUnifiedItem)
      expect(result.id).toBe(recipeUnifiedItem.id)
      expect(result.name).toBe(recipeUnifiedItem.name)
      expect(result.quantity).toBe(recipeUnifiedItem.quantity)
      expect(result.macros).toEqual({ carbs: 0, protein: 0, fat: 0 })
      expect(result.reference).toBe(0)
      expect(result.__type).toBe('Item')
    })
  })
})
