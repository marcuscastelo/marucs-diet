import { describe, expect, it } from 'vitest'

import { createNewDayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { createInsertLegacyDayDietDAOFromNewDayDiet } from '~/modules/diet/day-diet/infrastructure/dayDietDAO'
import { createItem } from '~/modules/diet/item/domain/item'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createNewMeal, promoteMeal } from '~/modules/diet/meal/domain/meal'
import { itemToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'

describe('dayDietDAO legacy conversion', () => {
  const baseItem = {
    ...createItem({
      name: 'Arroz',
      reference: 1,
      quantity: 100,
      macros: createMacroNutrients({ carbs: 10, protein: 2, fat: 1 }),
    }),
    id: 1,
  }

  const baseUnifiedItem = itemToUnifiedItem(baseItem)

  const baseMeal = promoteMeal(
    createNewMeal({
      name: 'Almoço',
      items: [baseUnifiedItem],
    }),
    { id: 1 },
  )

  const baseNewDayDiet = createNewDayDiet({
    target_day: '2025-06-19',
    owner: 1,
    meals: [baseMeal],
  })

  describe('createInsertLegacyDayDietDAOFromNewDayDiet', () => {
    it('converts a NewDayDiet to legacy DAO format', () => {
      const result = createInsertLegacyDayDietDAOFromNewDayDiet(baseNewDayDiet)

      expect(result.target_day).toBe('2025-06-19')
      expect(result.owner).toBe(1)
      expect(result.meals).toHaveLength(1)
      expect(result.meals[0]).toHaveProperty('groups')
      expect(result.meals[0]).not.toHaveProperty('items')
      expect(result.meals[0]?.groups).toHaveLength(1)
      expect(result.meals[0]?.groups[0]?.name).toBe('Arroz')
      expect(result.meals[0]?.groups[0]?.items).toHaveLength(1)
      expect(result.meals[0]?.groups[0]?.items[0]?.name).toBe('Arroz')
    })
  })
})
