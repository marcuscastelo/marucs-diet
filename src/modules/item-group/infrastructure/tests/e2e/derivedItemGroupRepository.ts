import { Day } from '@/src/modules/day/domain/day'
import { ItemGroupRepository } from '@/src/modules/item-group/domain/itemGroupRepository'
import { MealRepository } from '@/src/modules/meal/domain/mealRepository'

export function createDerivedItemGroupRepository(
  localDays: readonly Day[],
  mealRepository: Omit<MealRepository, 'fetchDayMeals'>,
): ItemGroupRepository {
  return {
    fetchMealItemGroups: async (dayId, mealId) => {
      const day = localDays.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (!meal) {
        throw new Error(`Meal ${mealId} not found`)
      }

      return meal.groups
    },
    updateItemGroup: async (dayId, mealId, itemGroupId, newItemGroup) => {
      const day = localDays.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (!meal) {
        throw new Error(`Meal ${mealId} not found`)
      }

      const newMeal = {
        ...meal,
        groups: meal.groups.map((itemGroup) =>
          itemGroup.id === itemGroupId ? newItemGroup : itemGroup,
        ),
      }

      return (
        await mealRepository.updateMeal(dayId, mealId, newMeal)
      )?.groups.find((itemGroup) => itemGroup.id === itemGroupId)
    },
    insertItemGroup: async (dayId, mealId, newItemGroup) => {
      const day = localDays.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (!meal) {
        throw new Error(`Meal ${mealId} not found`)
      }

      const newMeal = {
        ...meal,
        groups: [...meal.groups, newItemGroup],
      }

      return (
        await mealRepository.updateMeal(dayId, mealId, newMeal)
      )?.groups.find((itemGroup) => itemGroup.id === newItemGroup.id)
    },
    deleteItemGroup: async (dayId, mealId, itemGroupId) => {
      const day = localDays.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (!meal) {
        throw new Error(`Meal ${mealId} not found`)
      }

      const newMeal = {
        ...meal,
        groups: meal.groups.filter((itemGroup) => itemGroup.id !== itemGroupId),
      }

      await mealRepository.updateMeal(dayId, mealId, newMeal)
    },
  }
}
