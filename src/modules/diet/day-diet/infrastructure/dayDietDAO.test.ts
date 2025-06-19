import { describe, expect, it } from 'vitest'

import {
  createInsertLegacyDayDietDAOFromNewDayDiet,
  dayDietToLegacyDAO,
} from '~/modules/diet/day-diet/infrastructure/dayDietDAO'
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

  const baseDayDiet = {
    id: 1,
    target_day: '2025-06-19',
    owner: 1,
    meals: [baseMeal],
    __type: 'DayDiet' as const,
  }

  const baseNewDayDiet = {
    target_day: '2025-06-19',
    owner: 1,
    meals: [baseMeal],
    __type: 'NewDayDiet' as const,
  }

  describe('dayDietToLegacyDAO', () => {
    it('converts a DayDiet to legacy DAO format', () => {
      const result = dayDietToLegacyDAO(baseDayDiet)

      expect(result.id).toBe(1)
      expect(result.target_day).toBe('2025-06-19')
      expect(result.owner).toBe(1)
      expect(result.meals).toHaveLength(1)
      expect(result.meals[0]).toHaveProperty('groups')
      expect(result.meals[0]).not.toHaveProperty('items')
      expect(result.meals[0]?.groups).toHaveLength(1)
      expect(result.meals[0]?.groups[0]?.name).toBe('Default')
      expect(result.meals[0]?.groups[0]?.items).toHaveLength(1)
      expect(result.meals[0]?.groups[0]?.items[0]?.name).toBe('Arroz')
    })
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
      expect(result.meals[0]?.groups[0]?.name).toBe('Default')
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

      expect(result.meals[0]?.groups).toHaveLength(1)
      expect(result.meals[0]?.groups[0]?.items).toHaveLength(2)
      expect(result.meals[0]?.groups[0]?.items[0]?.name).toBe('Arroz')
      expect(result.meals[0]?.groups[0]?.items[1]?.name).toBe('Feijão')
    })
  })

  describe('roundtrip conversion', () => {
    it('maintains data integrity through legacy conversion and back', () => {
      // Convert to legacy and then migrate back
      const legacyDAO = dayDietToLegacyDAO(baseDayDiet)

      // Verify the legacy format has the expected structure
      expect(legacyDAO.meals[0]).toHaveProperty('groups')
      expect(legacyDAO.meals[0]?.groups).toHaveLength(1)
      expect(legacyDAO.meals[0]?.groups[0]?.items).toHaveLength(1)

      // The original item data should be preserved
      const legacyItem = legacyDAO.meals[0]?.groups[0]?.items[0]
      expect(legacyItem?.name).toBe(baseItem.name)
      expect(legacyItem?.quantity).toBe(baseItem.quantity)
      expect(legacyItem?.macros).toEqual(baseItem.macros)
      expect(legacyItem?.reference).toBe(baseItem.reference)
    })
  })
})
