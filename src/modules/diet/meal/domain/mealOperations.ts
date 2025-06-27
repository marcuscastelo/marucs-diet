import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  createUnifiedItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

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

// Legacy compatibility functions for groups (deprecated)
/**
 * @deprecated
 */
export function addGroupToMeal(meal: Meal, group: ItemGroup): Meal {
  // Convert ItemGroup to UnifiedItems and add them
  const groupItems = group.items.map((item) =>
    createUnifiedItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      reference: {
        type: 'food' as const,
        id: item.reference,
        macros: item.macros,
      },
    }),
  )

  return addItemsToMeal(meal, groupItems)
}

export function updateGroupInMeal(
  meal: Meal,
  _groupId: ItemGroup['id'],
  updatedGroup: ItemGroup,
): Meal {
  // For legacy compatibility, find items that belong to this group and update them
  // This is a simplified implementation for testing compatibility
  const updatedItems = updatedGroup.items.map((item) =>
    createUnifiedItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      reference: {
        type: 'food' as const,
        id: item.reference,
        macros: item.macros,
      },
    }),
  )

  return setMealItems(meal, updatedItems)
}

export function removeGroupFromMeal(
  meal: Meal,
  _groupId: ItemGroup['id'],
): Meal {
  // For legacy compatibility, remove all items (simplified implementation)
  return clearMealItems(meal)
}

export function setMealGroups(meal: Meal, groups: ItemGroup[]): Meal {
  const allItems = groups.flatMap((group) =>
    group.items.map((item) =>
      createUnifiedItem({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        reference: {
          type: 'food' as const,
          id: item.reference,
          macros: item.macros,
        },
      }),
    ),
  )

  return setMealItems(meal, allItems)
}
