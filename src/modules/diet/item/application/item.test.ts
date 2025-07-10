import { describe, expect, it } from 'vitest'

import { updateUnifiedItemQuantity } from '~/modules/diet/item/application/item'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { calcUnifiedItemMacros } from '~/shared/utils/macroMath'

describe('item application services', () => {
  const baseUnifiedItem = createUnifiedItem({
    id: 1,
    name: 'Arroz',
    quantity: 100,
    reference: {
      type: 'food' as const,
      id: 1,
      macros: createMacroNutrients(
        createMacroNutrients({ carbs: 10, protein: 2, fat: 1 }),
      ),
    },
  })

  describe('updateUnifiedItemQuantity', () => {
    it('updates the quantity of a unified item', () => {
      const result = updateUnifiedItemQuantity(baseUnifiedItem, 200)
      expect(result.quantity).toBe(200)
      expect(result.name).toBe(baseUnifiedItem.name)
      // Macros should scale proportionally with quantity
      expect(calcUnifiedItemMacros(result)).toEqual(
        createMacroNutrients({
          carbs: 20, // (10 * 200) / 100
          fat: 2, // (1 * 200) / 100
          protein: 4, // (2 * 200) / 100
        }),
      )
    })
  })
})
