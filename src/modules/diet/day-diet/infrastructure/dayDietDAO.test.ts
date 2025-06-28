import { describe, expect, it } from 'vitest'

import { createInsertLegacyDayDietDAOFromNewDayDiet } from '~/modules/diet/day-diet/infrastructure/dayDietDAO'
import { createItem } from '~/modules/diet/item/domain/item'
import { createMeal } from '~/modules/diet/meal/domain/meal'
import { itemToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'

describe('dayDietDAO legacy conversion', () => {
  const baseItem = {
    ...createItem({
      name: 'Arroz',
      reference: 1,
      quantity: 100,
      macros: { carbs: 10, protein: 2, fat: 1 },
    }),
    id: 1,
  }

  const baseUnifiedItem = itemToUnifiedItem(baseItem)

  const baseMeal = {
    ...createMeal({
      name: 'Almoço',
      items: [baseUnifiedItem],
    }),
    id: 1,
  }

  const baseNewDayDiet = {
    target_day: '2025-06-19',
    owner: 1,
    meals: [baseMeal],
    __type: 'NewDayDiet' as const,
  }

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

    it('handles meals with multiple unified items', () => {
      const item2 = {
        ...createItem({
          name: 'Feijão',
          reference: 2,
          quantity: 80,
          macros: { carbs: 15, protein: 8, fat: 1 },
        }),
        id: 2,
      }
      const unifiedItem2 = itemToUnifiedItem(item2)

      const mealWithMultipleItems = {
        ...createMeal({
          name: 'Almoço',
          items: [baseUnifiedItem, unifiedItem2],
        }),
        id: 1,
      }

      const dayDietWithMultipleItems = {
        target_day: '2025-06-19',
        owner: 1,
        meals: [mealWithMultipleItems],
        __type: 'NewDayDiet' as const,
      }

      const result = createInsertLegacyDayDietDAOFromNewDayDiet(
        dayDietWithMultipleItems,
      )

      expect(result.meals[0]?.groups).toHaveLength(2) // Now each standalone item gets its own group
      expect(result.meals[0]?.groups[0]?.name).toBe('Arroz') // First group named after first item
      expect(result.meals[0]?.groups[0]?.items).toHaveLength(1)
      expect(result.meals[0]?.groups[0]?.items[0]?.name).toBe('Arroz')
      expect(result.meals[0]?.groups[1]?.name).toBe('Feijão') // Second group named after second item
      expect(result.meals[0]?.groups[1]?.items).toHaveLength(1)
      expect(result.meals[0]?.groups[1]?.items[0]?.name).toBe('Feijão')
    })
  })
})
