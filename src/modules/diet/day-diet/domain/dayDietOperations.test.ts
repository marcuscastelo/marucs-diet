import { describe, expect, it } from 'vitest'

import type { DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  createNewDayDiet,
  promoteDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { updateMealInDayDiet } from '~/modules/diet/day-diet/domain/dayDietOperations'
import { createItem } from '~/modules/diet/item/domain/item'
import { createNewMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createNewMeal, promoteMeal } from '~/modules/diet/meal/domain/meal'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

function makeItem(id: number, name = 'Arroz') {
  return {
    ...createItem({
      name,
      reference: id,
      quantity: 100,
      macros: createNewMacroNutrients({ carbs: 10, protein: 2, fat: 1 }),
    }),
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

function makeMeal(
  id: number,
  name = 'Almoço',
  items = [makeUnifiedItemFromItem(makeItem(1))],
) {
  return promoteMeal(createNewMeal({ name, items }), id)
}

const baseItem = makeItem(1)
const baseMeal = makeMeal(1, 'Almoço', [makeUnifiedItemFromItem(baseItem)])
const baseDayDiet: DayDiet = promoteDayDiet(
  createNewDayDiet({
    target_day: '2023-01-01',
    owner: 1,
    meals: [baseMeal],
  }),
  1,
)

describe('dayDietOperations', () => {
  it('updateMealInDayDiet updates a meal', () => {
    const updated = makeMeal(1, 'Jantar', [makeUnifiedItemFromItem(baseItem)])
    const result = updateMealInDayDiet(baseDayDiet, 1, updated)
    expect(result.meals[0]?.name).toBe('Jantar')
  })
})
