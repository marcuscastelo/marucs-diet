import { describe, expect, it } from 'vitest'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { createItem } from '~/modules/diet/item/domain/item'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import {
  createMacroOverflowChecker,
  isOverflow,
  isOverflowForItemGroup,
  MacroOverflowContext,
} from '~/shared/utils/macroOverflow'

function makeFakeDayDiet(macros: {
  carbs: number
  protein: number
  fat: number
}): DayDiet {
  // Create a fake item with the desired macros and quantity 100
  const item = createItem({
    name: 'Fake',
    reference: 1,
    quantity: 100,
    macros,
  })
  // Create a group with the item
  const group = {
    id: 1,
    name: 'Group',
    items: [item],
    recipe: undefined,
    __type: 'ItemGroup' as const,
  }
  // Create a meal with the group
  const meal = {
    id: 1,
    name: 'Meal',
    groups: [group],
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

const baseItem: TemplateItem = createItem({
  name: 'Chicken',
  reference: 1,
  quantity: 1,
  macros: { carbs: 0, protein: 30, fat: 5 },
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
    const item = createItem({
      name: 'Chicken',
      reference: 1,
      quantity: 100,
      macros: { carbs: 0, protein: 30, fat: 5 },
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
        originalItem: createItem({
          name: 'Chicken',
          reference: 1,
          quantity: 1,
          macros: { carbs: 0, protein: 20, fat: 5 },
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

  it('returns false for zero macro targets', () => {
    const context = {
      ...baseContext,
      macroTarget: { carbs: 0, protein: 0, fat: 0 },
    }
    expect(isOverflow(baseItem, 'carbs', context)).toBe(false)
    expect(isOverflow(baseItem, 'protein', context)).toBe(false)
    expect(isOverflow(baseItem, 'fat', context)).toBe(false)
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

describe('isOverflowForItemGroup', () => {
  it('returns false for empty group', () => {
    expect(isOverflowForItemGroup([], 'carbs', baseContext)).toBe(false)
  })

  it('returns true if group addition exceeds macro', () => {
    const items: TemplateItem[] = [
      createItem({
        name: 'A',
        reference: 1,
        quantity: 100,
        macros: { carbs: 10, protein: 10, fat: 10 },
      }),
      createItem({
        name: 'B',
        reference: 2,
        quantity: 100,
        macros: { carbs: 20, protein: 20, fat: 20 },
      }),
    ]
    const context = {
      ...baseContext,
      currentDayDiet: makeFakeDayDiet({ carbs: 75, protein: 80, fat: 30 }), // 75 + 30 = 105 > 100
    }
    expect(isOverflowForItemGroup(items, 'carbs', context)).toBe(true)
  })
})
