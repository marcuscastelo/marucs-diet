import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'

/**
 * Pure functions for meal operations
 * Replaces the deprecated MealEditor pattern
 */

export function updateMealName(meal: Meal, name: string): Meal {
  return {
    ...meal,
    name,
  }
}

export function addGroupToMeal(meal: Meal, group: ItemGroup): Meal {
  return {
    ...meal,
    groups: [...meal.groups, group],
  }
}

export function addGroupsToMeal(
  meal: Meal,
  groups: readonly ItemGroup[],
): Meal {
  return {
    ...meal,
    groups: [...meal.groups, ...groups],
  }
}

export function updateGroupInMeal(
  meal: Meal,
  groupId: ItemGroup['id'],
  updatedGroup: ItemGroup,
): Meal {
  return {
    ...meal,
    groups: meal.groups.map((group) =>
      group.id === groupId ? updatedGroup : group,
    ),
  }
}

export function removeGroupFromMeal(
  meal: Meal,
  groupId: ItemGroup['id'],
): Meal {
  return {
    ...meal,
    groups: meal.groups.filter((group) => group.id !== groupId),
  }
}

export function setMealGroups(meal: Meal, groups: ItemGroup[]): Meal {
  return {
    ...meal,
    groups,
  }
}

export function clearMealGroups(meal: Meal): Meal {
  return {
    ...meal,
    groups: [],
  }
}

export function findGroupInMeal(
  meal: Meal,
  groupId: ItemGroup['id'],
): ItemGroup | undefined {
  return meal.groups.find((group) => group.id === groupId)
}

export function replaceMeal(meal: Meal, updates: Partial<Meal>): Meal {
  return {
    ...meal,
    ...updates,
  }
}
