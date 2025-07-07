import { describe, expect, it } from 'vitest'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createMacroOverflowChecker,
  isOverflow,
  type MacroOverflowContext,
} from '~/shared/utils/macroOverflow'

function makeFakeDayDiet(macros: {
  carbs: number
  protein: number
  fat: number
}): DayDiet {
  // Create a fake unified item with the desired macros and quantity 100
  const unifiedItem = createUnifiedItem({
    id: 1,
    name: 'Fake',
    quantity: 100,
    reference: {
      type: 'food' as const,
      id: 1,
      macros,
    },
  })

  // Create a meal with the unified items
  const meal = {
    id: 1,
    name: 'Meal',
    items: [unifiedItem],
    __type: 'Meal' as const,
  }
  // Return a DayDiet with the meal
  return {
    id: 1,
    target_day: '2025-01-01',
    owner: 1,
    meals: [meal],
    __type: 'DayDiet',
  }
}

const baseItem: TemplateItem = createUnifiedItem({
  id: 1,
  name: 'Chicken',
  quantity: 1,
  reference: {
    type: 'food' as const,
    id: 1,
    macros: { carbs: 0, protein: 30, fat: 5 },
  },
})

const baseContext: MacroOverflowContext = {
  currentDayDiet: makeFakeDayDiet({ carbs: 0, protein: 0, fat: 0 }),
  macroTarget: { carbs: 100, protein: 100, fat: 50 },
  macroOverflowOptions: { enable: true },
}

describe('isOverflow', () => {
  it('returns false if overflow is disabled', () => {
    const context = { ...baseContext, macroOverflowOptions: { enable: false } }
    expect(isOverflow(baseItem, 'protein', context)).toBe(false)
  })

  it('returns true if adding item exceeds macro target', () => {
    const context = {
      ...baseContext,
      currentDayDiet: makeFakeDayDiet({ carbs: 0, protein: 80, fat: 45 }), // 80 + 30 = 110 > 100
    }
    // Use quantity: 100 to match macro math (per 100g)
    const item = createUnifiedItem({
      id: 1,
      name: 'Chicken',
      quantity: 100,
      reference: {
        type: 'food' as const,
        id: 1,
        macros: { carbs: 0, protein: 30, fat: 5 },
      },
    })
    expect(isOverflow(item, 'protein', context)).toBe(true)
  })

  it('returns false if adding item does not exceed macro target', () => {
    const context = {
      ...baseContext,
      currentDayDiet: makeFakeDayDiet({ carbs: 0, protein: 60, fat: 45 }),
    }
    expect(isOverflow(baseItem, 'protein', context)).toBe(false)
  })

  it('handles originalItem for edit scenarios', () => {
    const context = {
      ...baseContext,
      currentDayDiet: makeFakeDayDiet({ carbs: 0, protein: 90, fat: 45 }),
      macroOverflowOptions: {
        enable: true,
        originalItem: createUnifiedItem({
          id: 1,
          name: 'Chicken',
          quantity: 1,
          reference: {
            type: 'food' as const,
            id: 1,
            macros: { carbs: 0, protein: 20, fat: 5 },
          },
        }),
      },
    }
    expect(isOverflow(baseItem, 'protein', context)).toBe(false)
  })
})

// TODO: Consider property-based testing for macro overflow logic if logic becomes more complex.

describe('isOverflow (edge cases)', () => {
  it('returns false for negative macro values', () => {
    const context = {
      ...baseContext,
      currentDayDiet: makeFakeDayDiet({ carbs: -10, protein: -10, fat: -10 }),
    }
    expect(isOverflow(baseItem, 'carbs', context)).toBe(false)
    expect(isOverflow(baseItem, 'protein', context)).toBe(false)
    expect(isOverflow(baseItem, 'fat', context)).toBe(false)
  })

  it('returns true for positive macro values when target is zero', () => {
    const context = {
      ...baseContext,
      macroTarget: { carbs: 0, protein: 0, fat: 0 },
    }
    const carbItem = createUnifiedItem({
      id: 1,
      name: 'Carb',
      quantity: 100,
      reference: {
        type: 'food' as const,
        id: 1,
        macros: { carbs: 10, protein: 0, fat: 0 },
      },
    })
    const proteinItem = createUnifiedItem({
      id: 2,
      name: 'Protein',
      quantity: 100,
      reference: {
        type: 'food' as const,
        id: 2,
        macros: { carbs: 0, protein: 10, fat: 0 },
      },
    })
    const fatItem = createUnifiedItem({
      id: 3,
      name: 'Fat',
      quantity: 100,
      reference: {
        type: 'food' as const,
        id: 3,
        macros: { carbs: 0, protein: 0, fat: 10 },
      },
    })
    expect(isOverflow(carbItem, 'carbs', context)).toBe(true)
    expect(isOverflow(proteinItem, 'protein', context)).toBe(true)
    expect(isOverflow(fatItem, 'fat', context)).toBe(true)
  })

  it('returns false for invalid property', () => {
    // @ts-expect-error: purposely passing invalid property
    expect(isOverflow(baseItem, 'invalid', baseContext)).toBe(false)
  })

  it('returns false for null macroTarget', () => {
    const context = { ...baseContext, macroTarget: null }
    expect(isOverflow(baseItem, 'carbs', context)).toBe(false)
  })

  it('returns false for null currentDayDiet', () => {
    const context = { ...baseContext, currentDayDiet: null }
    expect(isOverflow(baseItem, 'carbs', context)).toBe(false)
  })
})

describe('createMacroOverflowChecker', () => {
  it('returns correct overflow checkers for all macros', () => {
    const context = {
      ...baseContext,
      currentDayDiet: makeFakeDayDiet({ carbs: 90, protein: 90, fat: 45 }),
    }
    const checker = createMacroOverflowChecker(baseItem, context)
    expect(checker.carbs()).toBe(false)
    expect(checker.protein()).toBe(false)
    expect(checker.fat()).toBe(false)
  })
})
