import { describe, expect, it } from 'vitest'

import { createItem } from '~/modules/diet/item/domain/item'
import { createSimpleItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createNewMeal, promoteMeal } from '~/modules/diet/meal/domain/meal'
import {
  addItemsToMeal,
  removeItemFromMeal,
  setMealItems,
  updateItemInMeal,
} from '~/modules/diet/meal/domain/mealOperations'
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
  return promoteMeal(createNewMeal({ name, items }), { id })
}

const baseItem = makeItem(1)
const baseUnifiedItem = makeUnifiedItemFromItem(baseItem)
const baseMeal = makeMeal(1, 'Almoço', [baseUnifiedItem])

describe('mealOperations', () => {
  it('addItemsToMeal adds multiple items', () => {
    const items = [
      makeUnifiedItemFromItem(makeItem(2, 'Feijão')),
      makeUnifiedItemFromItem(makeItem(3, 'Carne')),
    ]
    const result = addItemsToMeal(baseMeal, items)
    expect(result.items).toHaveLength(3)
  })

  it('updateItemInMeal updates an item', () => {
    const updatedItem = createUnifiedItem({
      ...baseUnifiedItem,
      name: 'Arroz Integral',
    })
    const result = updateItemInMeal(baseMeal, 1, updatedItem)
    expect(result.items[0]?.name).toBe('Arroz Integral')
  })

  it('removeItemFromMeal removes an item', () => {
    const result = removeItemFromMeal(baseMeal, 1)
    expect(result.items).toHaveLength(0)
  })

  it('setMealItems sets items', () => {
    const items = [makeUnifiedItemFromItem(makeItem(2, 'Feijão'))]
    const result = setMealItems(baseMeal, items)
    expect(result.items).toEqual(items)
  })
})
