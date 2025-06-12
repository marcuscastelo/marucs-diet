// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import type { MacroOverflowContext } from '~/legacy/utils/macroOverflow'
import { isOverflowForItemGroup } from '~/legacy/utils/macroOverflow'
import type { DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { createItem, type Item } from '~/modules/diet/item/domain/item'
import { TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

function makeItem(macros: Item['macros']): TemplateItem {
  return createItem({
    id: 1,
    name: 'item',
    reference: 1,
    quantity: 100,
    macros: {
      carbs: macros.carbs,
      protein: macros.protein,
      fat: macros.fat,
    },
  }) as TemplateItem
}

function makeDayDietWithMacros({
  carbs,
  protein,
  fat,
}: {
  carbs: number
  protein: number
  fat: number
}): DayDiet {
  return {
    meals: [
      {
        groups: [
          {
            macros: { carbs, protein, fat },
            items: [],
          },
        ],
      },
    ],
  } as unknown as DayDiet
}

describe('isOverflowForItemGroup', () => {
  const baseContext: MacroOverflowContext = {
    currentDayDiet: makeDayDietWithMacros({ carbs: 0, protein: 0, fat: 0 }),
    macroTarget: { carbs: 100, protein: 100, fat: 100 },
    macroOverflowOptions: { enable: true },
  }

  it('returns false if items is empty', () => {
    expect(isOverflowForItemGroup([], 'carbs', baseContext)).toBe(false)
  })

  it('returns false if overflow is disabled', () => {
    const ctx = { ...baseContext, macroOverflowOptions: { enable: false } }
    expect(
      isOverflowForItemGroup(
        [makeItem({ carbs: 200, protein: 0, fat: 0 })],
        'carbs',
        ctx,
      ),
    ).toBe(false)
  })

  it('returns true if sum of group exceeds target', () => {
    const items = [
      makeItem({ carbs: 60, protein: 0, fat: 0 }),
      makeItem({ carbs: 50, protein: 0, fat: 0 }),
    ]
    // currentDayDiet: 0, sum: 110, target: 100
    expect(isOverflowForItemGroup(items, 'carbs', baseContext)).toBe(true)
  })

  it('returns false if sum of group does not exceed target', () => {
    const items = [
      makeItem({ carbs: 30, protein: 0, fat: 0 }),
      makeItem({ carbs: 40, protein: 0, fat: 0 }),
    ]
    expect(isOverflowForItemGroup(items, 'carbs', baseContext)).toBe(false)
  })

  it('handles originalItem subtraction (edit scenario)', () => {
    const items = [
      makeItem({ carbs: 60, protein: 0, fat: 0 }),
      makeItem({ carbs: 50, protein: 0, fat: 0 }),
    ]
    // (60+50) - 20 = 90, which is < 100
    const ctx1 = {
      ...baseContext,
      macroOverflowOptions: {
        enable: true,
        originalItem: makeItem({ carbs: 20, protein: 0, fat: 0 }),
      },
    }
    expect(isOverflowForItemGroup(items, 'carbs', ctx1)).toBe(false)
    // (60+50) - 5 = 105, which is > 100
    const ctx2 = {
      ...baseContext,
      macroOverflowOptions: {
        enable: true,
        originalItem: makeItem({ carbs: 5, protein: 0, fat: 0 }),
      },
    }
    expect(isOverflowForItemGroup(items, 'carbs', ctx2)).toBe(true)
  })
})
