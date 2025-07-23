import { type Meal } from '~/modules/diet/meal/domain/meal'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export function addItemToMeal(meal: Meal, item: UnifiedItem): Meal {
  return {
    ...meal,
    items: [...meal.items, item],
  }
}

export function addItemsToMeal(
  meal: Meal,
  items: readonly UnifiedItem[],
): Meal {
  return {
    ...meal,
    items: [...meal.items, ...items],
  }
}

export function updateItemInMeal(
  meal: Meal,
  itemId: UnifiedItem['id'],
  updatedItem: UnifiedItem,
): Meal {
  return {
    ...meal,
    items: meal.items.map((item) => (item.id === itemId ? updatedItem : item)),
  }
}

export function removeItemFromMeal(
  meal: Meal,
  itemId: UnifiedItem['id'],
): Meal {
  return {
    ...meal,
    items: meal.items.filter((item) => item.id !== itemId),
  }
}

export function setMealItems(meal: Meal, items: UnifiedItem[]): Meal {
  return {
    ...meal,
    items,
  }
}

export function clearMealItems(meal: Meal): Meal {
  return {
    ...meal,
    items: [],
  }
}
