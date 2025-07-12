import { describe, expect, it } from 'vitest'

import {
  type LegacyMeal,
  migrateLegacyMealsToUnified,
  migrateLegacyMealToUnified,
  migrateUnifiedMealToLegacy,
} from '~/modules/diet/day-diet/infrastructure/migrationUtils'
import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createNewMeal, promoteMeal } from '~/modules/diet/meal/domain/meal'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
      name,
      reference: id,
      quantity: 100,
      macros: createMacroNutrients({ carbs: 10, protein: 2, fat: 1 }),
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
  return createUnifiedItem({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    reference: {
      type: 'food' as const,
      id: item.reference,
      macros: item.macros,
    },
  })
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
  return promoteMeal(createNewMeal({ name, items }), { id })
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
      expect(result.items).toHaveLength(1)
      expect(result.items[0]?.name).toBe('Arroz')
      expect(result.items[0]?.reference.type).toBe('food')
      expect(result.items[0]?.__type).toBe('UnifiedItem')
    })

    it('handles multiple groups with different strategies', () => {
      const group1 = makeGroup(1, 'Carboidratos', [
        makeItem(1, 'Arroz'),
        makeItem(2, 'Feijão'),
      ])
      const group2 = makeGroup(2, 'Proteínas', [makeItem(3, 'Frango')])
      const meal = makeLegacyMeal(1, 'Almoço', [group1, group2])

      const result = migrateLegacyMealToUnified(meal)

      // Should have 2 items: 1 multi-item group (Carboidratos) + 1 flattened item (Frango)
      expect(result.items).toHaveLength(2)

      // Check if multi-item group is preserved
      const groupItem = result.items.find(
        (item) => item.name === 'Carboidratos',
      )
      expect(groupItem).toBeDefined()
      expect(groupItem?.reference.type).toBe('group')
      if (groupItem?.reference.type === 'group') {
        expect(groupItem.reference.children).toHaveLength(2)
        expect(
          groupItem.reference.children.map((child) => child.name),
        ).toContain('Arroz')
        expect(
          groupItem.reference.children.map((child) => child.name),
        ).toContain('Feijão')
      }

      // Check if single-item group was flattened
      const flattenedItem = result.items.find((item) => item.name === 'Frango')
      expect(flattenedItem).toBeDefined()
      expect(flattenedItem?.reference.type).toBe('food')
    })

    it('should preserve empty groups and flatten single-item groups', () => {
      const emptyGroup = makeGroup(1, 'Grupo Vazio', [])
      const singleItemGroup = makeGroup(2, 'Grupo com 1 Item', [
        makeItem(1, 'Arroz'),
      ])
      const multiItemGroup = makeGroup(3, 'Grupo com 2 Items', [
        makeItem(2, 'Feijão'),
        makeItem(3, 'Carne'),
      ])
      const meal = makeLegacyMeal(1, 'Almoço', [
        emptyGroup,
        singleItemGroup,
        multiItemGroup,
      ])

      const result = migrateLegacyMealToUnified(meal)

      // Should have 3 items: 1 from empty group + 1 flattened item + 1 multi-item group
      expect(result.items).toHaveLength(3)

      // Check if empty group is preserved as UnifiedItem with group reference
      const emptyGroupItem = result.items.find(
        (item) => item.name === 'Grupo Vazio',
      )
      expect(emptyGroupItem).toBeDefined()
      expect(emptyGroupItem?.reference.type).toBe('group')
      if (emptyGroupItem?.reference.type === 'group') {
        expect(emptyGroupItem.reference.children).toEqual([])
      }

      // Check if single-item group was flattened to a food item
      const flattenedItem = result.items.find((item) => item.name === 'Arroz')
      expect(flattenedItem).toBeDefined()
      expect(flattenedItem?.reference.type).toBe('food')

      // Check if multi-item group is preserved as group
      const multiItemGroupItem = result.items.find(
        (item) => item.name === 'Grupo com 2 Items',
      )
      expect(multiItemGroupItem).toBeDefined()
      expect(multiItemGroupItem?.reference.type).toBe('group')
      if (multiItemGroupItem?.reference.type === 'group') {
        expect(multiItemGroupItem.reference.children).toHaveLength(2)
      }
    })

    it('should never flatten recipe groups regardless of item count', () => {
      const singleItemRecipe = makeGroup(1, 'Recipe with 1 item', [
        makeItem(1, 'Flour'),
      ])
      singleItemRecipe.recipe = 123 // Mark as recipe

      const multiItemRecipe = makeGroup(2, 'Recipe with 2 items', [
        makeItem(2, 'Sugar'),
        makeItem(3, 'Eggs'),
      ])
      multiItemRecipe.recipe = 456 // Mark as recipe

      const meal = makeLegacyMeal(1, 'Breakfast', [
        singleItemRecipe,
        multiItemRecipe,
      ])

      const result = migrateLegacyMealToUnified(meal)

      // Should have 2 items: both recipes preserved as groups
      expect(result.items).toHaveLength(2)

      // Check if single-item recipe is preserved (not flattened)
      const singleRecipeItem = result.items.find(
        (item) => item.name === 'Recipe with 1 item',
      )
      expect(singleRecipeItem).toBeDefined()
      expect(singleRecipeItem?.reference.type).toBe('recipe')
      if (singleRecipeItem?.reference.type === 'recipe') {
        expect(singleRecipeItem.reference.id).toBe(123)
      }

      // Check if multi-item recipe is preserved
      const multiRecipeItem = result.items.find(
        (item) => item.name === 'Recipe with 2 items',
      )
      expect(multiRecipeItem).toBeDefined()
      expect(multiRecipeItem?.reference.type).toBe('recipe')
      if (multiRecipeItem?.reference.type === 'recipe') {
        expect(multiRecipeItem.reference.id).toBe(456)
      }
    })
  })

  describe('migrateUnifiedMealToLegacy', () => {
    it('converts unified meal with items to legacy meal with groups', () => {
      const result = migrateUnifiedMealToLegacy(baseUnifiedMeal)

      expect(result.id).toBe(1)
      expect(result.name).toBe('Almoço')
      expect(result.__type).toBe('Meal')
      expect(result.groups).toHaveLength(1)
      expect(result.groups[0]?.name).toBe('Arroz') // Should use item name for single items
      expect(result.groups[0]?.items).toHaveLength(1)
      expect(result.groups[0]?.items[0]?.name).toBe('Arroz')
    })

    it('handles multiple standalone items with intelligent group naming', () => {
      const multiItemUnifiedMeal = makeUnifiedMeal(2, 'Jantar', [
        makeUnifiedItemFromItem(makeItem(1, 'Arroz')),
        makeUnifiedItemFromItem(makeItem(2, 'Feijão')),
      ])

      const result = migrateUnifiedMealToLegacy(multiItemUnifiedMeal)

      expect(result.groups).toHaveLength(2) // Should create one group per standalone item
      expect(result.groups[0]?.name).toBe('Arroz') // Should use item name for each group
      expect(result.groups[0]?.items).toHaveLength(1)
      expect(result.groups[0]?.items[0]?.name).toBe('Arroz')
      expect(result.groups[1]?.name).toBe('Feijão')
      expect(result.groups[1]?.items).toHaveLength(1)
      expect(result.groups[1]?.items[0]?.name).toBe('Feijão')
    })

    it('preserves original item IDs when converting standalone items to groups', () => {
      const item1 = makeUnifiedItemFromItem(makeItem(123, 'Arroz'))
      const item2 = makeUnifiedItemFromItem(makeItem(456, 'Feijão'))
      const unifiedMeal = makeUnifiedMeal(1, 'Almoço', [item1, item2])

      const result = migrateUnifiedMealToLegacy(unifiedMeal)

      // Each standalone item should become a group with the same ID as the original item
      expect(result.groups).toHaveLength(2)
      expect(result.groups[0]?.id).toBe(123) // Should preserve item ID, not use -1
      expect(result.groups[0]?.items[0]?.id).toBe(123)
      expect(result.groups[1]?.id).toBe(456) // Should preserve item ID, not use -1
      expect(result.groups[1]?.items[0]?.id).toBe(456)
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
      const legacyMeal = legacyDayData.meals[0] as LegacyMeal // eslint-disable-line @typescript-eslint/consistent-type-assertions
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
