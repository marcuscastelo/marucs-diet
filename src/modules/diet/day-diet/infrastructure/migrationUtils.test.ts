import { describe, expect, it } from 'vitest'

import {
  type LegacyMeal,
  migrateLegacyMealsToUnified,
  migrateLegacyMealToUnified,
  migrateUnifiedMealsToLegacy,
  migrateUnifiedMealToLegacy,
} from '~/modules/diet/day-diet/infrastructure/migrationUtils'
import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createMeal } from '~/modules/diet/meal/domain/meal'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
      name,
      reference: id,
      quantity: 100,
      macros: { carbs: 10, protein: 2, fat: 1 },
    }),
    id,
  }
}

function makeGroup(id: number, name = 'G1', items = [makeItem(1)]) {
  return {
    ...createSimpleItemGroup({ name, items }),
    id,
  }
}

function makeUnifiedItemFromItem(item: ReturnType<typeof makeItem>) {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    macros: item.macros,
    reference: { type: 'food' as const, id: item.reference },
    __type: 'UnifiedItem' as const,
  }
}

function makeLegacyMeal(
  id: number,
  name = 'Almoço',
  groups = [makeGroup(1)],
): LegacyMeal {
  return {
    id,
    name,
    groups,
    __type: 'Meal',
  }
}

function makeUnifiedMeal(
  id: number,
  name = 'Almoço',
  items = [makeUnifiedItemFromItem(makeItem(1))],
) {
  return {
    ...createMeal({ name, items }),
    id,
  }
}

const baseItem = makeItem(1)
const baseGroup = makeGroup(1, 'G1', [baseItem])
const baseLegacyMeal = makeLegacyMeal(1, 'Almoço', [baseGroup])
const baseUnifiedMeal = makeUnifiedMeal(1, 'Almoço', [
  makeUnifiedItemFromItem(baseItem),
])

describe('infrastructure migration utils', () => {
  describe('migrateLegacyMealToUnified', () => {
    it('converts legacy meal with groups to unified meal with items', () => {
      const result = migrateLegacyMealToUnified(baseLegacyMeal)

      expect(result.id).toBe(1)
      expect(result.name).toBe('Almoço')
      expect(result.__type).toBe('Meal')
      expect(result.items).toHaveLength(1)
      expect(result.items[0]?.name).toBe('Arroz')
      expect(result.items[0]?.reference.type).toBe('food')
      expect(result.items[0]?.__type).toBe('UnifiedItem')
    })

    it('handles multiple groups with multiple items', () => {
      const group1 = makeGroup(1, 'Carboidratos', [
        makeItem(1, 'Arroz'),
        makeItem(2, 'Feijão'),
      ])
      const group2 = makeGroup(2, 'Proteínas', [makeItem(3, 'Frango')])
      const meal = makeLegacyMeal(1, 'Almoço', [group1, group2])

      const result = migrateLegacyMealToUnified(meal)

      expect(result.items).toHaveLength(3) // 3 individual food items from the groups
      expect(result.items.map((item) => item.name)).toContain('Arroz')
      expect(result.items.map((item) => item.name)).toContain('Feijão')
      expect(result.items.map((item) => item.name)).toContain('Frango')
    })
  })

  describe('migrateUnifiedMealToLegacy', () => {
    it('converts unified meal with items to legacy meal with groups', () => {
      const result = migrateUnifiedMealToLegacy(baseUnifiedMeal)

      expect(result.id).toBe(1)
      expect(result.name).toBe('Almoço')
      expect(result.__type).toBe('Meal')
      expect(result.groups).toHaveLength(1)
      expect(result.groups[0]?.name).toBe('Default')
      expect(result.groups[0]?.items).toHaveLength(1)
      expect(result.groups[0]?.items[0]?.name).toBe('Arroz')
    })
  })

  describe('migrateLegacyMealsToUnified', () => {
    it('converts an array of legacy meals', () => {
      const legacyMeals = [
        baseLegacyMeal,
        makeLegacyMeal(2, 'Jantar', [
          makeGroup(2, 'G2', [makeItem(2, 'Carne')]),
        ]),
      ]

      const result = migrateLegacyMealsToUnified(legacyMeals)

      expect(result).toHaveLength(2)
      expect(result[0]?.name).toBe('Almoço')
      expect(result[1]?.name).toBe('Jantar')
      expect(result[0]?.items).toHaveLength(1)
      expect(result[1]?.items).toHaveLength(1)
    })
  })

  describe('migrateUnifiedMealsToLegacy', () => {
    it('converts an array of unified meals', () => {
      const unifiedMeals = [
        baseUnifiedMeal,
        makeUnifiedMeal(2, 'Jantar', [
          makeUnifiedItemFromItem(makeItem(2, 'Carne')),
        ]),
      ]

      const result = migrateUnifiedMealsToLegacy(unifiedMeals)

      expect(result).toHaveLength(2)
      expect(result[0]?.name).toBe('Almoço')
      expect(result[1]?.name).toBe('Jantar')
      expect(result[0]?.groups).toHaveLength(1)
      expect(result[1]?.groups).toHaveLength(1)
      expect(result[0]?.groups[0]?.items[0]?.name).toBe('Arroz')
      expect(result[1]?.groups[0]?.items[0]?.name).toBe('Carne')
    })
  })

  describe('Backward Compatibility Functions', () => {
    it('should handle day data with legacy meal format', () => {
      const legacyDayData = {
        id: 1,
        target_day: '2025-06-18',
        owner: 1,
        meals: [
          {
            id: 1,
            name: 'Breakfast',
            groups: [makeGroup(1, 'Cereals', [makeItem(1, 'Oats')])],
            __type: 'Meal',
          },
          {
            id: 2,
            name: 'Lunch',
            groups: [
              makeGroup(2, 'Main', [makeItem(2, 'Rice'), makeItem(3, 'Beans')]),
            ],
            __type: 'Meal',
          },
        ],
      }

      // Test that the legacy meal can be migrated to unified format
      const legacyMeal = legacyDayData.meals[0] as LegacyMeal
      const unifiedMeal = migrateLegacyMealToUnified(legacyMeal)

      expect(unifiedMeal).toHaveProperty('items')
      expect(unifiedMeal).not.toHaveProperty('groups')
      expect(unifiedMeal.items).toHaveLength(1)
      expect(unifiedMeal.items[0]).toBeDefined()
      expect(unifiedMeal.items[0]?.name).toBe('Oats')
    })

    it('should handle multiple legacy meals in array', () => {
      const legacyMeals = [
        makeLegacyMeal(1, 'Breakfast', [
          makeGroup(1, 'Cereals', [makeItem(1, 'Oats')]),
        ]),
        makeLegacyMeal(2, 'Lunch', [
          makeGroup(2, 'Main', [makeItem(2, 'Rice')]),
        ]),
      ]

      const unifiedMeals = migrateLegacyMealsToUnified(legacyMeals)

      expect(unifiedMeals).toHaveLength(2)
      expect(unifiedMeals[0]).toHaveProperty('items')
      expect(unifiedMeals[0]).not.toHaveProperty('groups')
      expect(unifiedMeals[1]).toHaveProperty('items')
      expect(unifiedMeals[1]).not.toHaveProperty('groups')
    })

    it('should handle roundtrip migration correctly', () => {
      const originalLegacyMeal = makeLegacyMeal(1, 'Test', [makeGroup(1)])
      const unifiedMeal = migrateLegacyMealToUnified(originalLegacyMeal)
      const backToLegacy = migrateUnifiedMealToLegacy(unifiedMeal)

      expect(backToLegacy).toHaveProperty('groups')
      expect(backToLegacy).not.toHaveProperty('items')
      expect(backToLegacy.groups).toHaveLength(1)
    })
  })
})
