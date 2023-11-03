import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { type ItemGroupRepository } from '@/modules/diet/item-group/domain/itemGroupRepository'
import { type MealRepository } from '@/modules/diet/meal/domain/mealRepository'
import { type Accessor } from 'solid-js'

export function createDerivedItemGroupRepository (
  localDays: Accessor<readonly DayDiet[]>,
  mealRepository: MealRepository
): ItemGroupRepository {
  return {
    fetchMealItemGroups: async (dayId, mealId) => {
      await mealRepository.fetchDayMeals(dayId)

      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (meal === undefined) {
        throw new Error(`Meal ${mealId} not found`)
      }

      return meal.groups
    },
    updateItemGroup: async (dayId, mealId, itemGroupId, newItemGroup) => {
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (meal === undefined) {
        throw new Error(`Meal ${mealId} not found`)
      }

      const newMeal = {
        ...meal,
        groups: meal.groups.map((itemGroup) =>
          itemGroup.id === itemGroupId ? newItemGroup : itemGroup
        )
      }

      return (
        await mealRepository.updateMeal(dayId, mealId, newMeal)
      )?.groups.find((itemGroup) => itemGroup.id === itemGroupId)
    },
    insertItemGroup: async (dayId, mealId, newItemGroup) => {
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (meal === undefined) {
        throw new Error(`Meal ${mealId} not found`)
      }

      const newMeal = {
        ...meal,
        groups: [...meal.groups, newItemGroup]
      }

      return (
        await mealRepository.updateMeal(dayId, mealId, newMeal)
      )?.groups.find((itemGroup) => itemGroup.id === newItemGroup.id)
    },
    deleteItemGroup: async (dayId, mealId, itemGroupId) => {
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const meal = day.meals.find((meal) => meal.id === mealId)
      if (meal === undefined) {
        throw new Error(`Meal ${mealId} not found`)
      }

      const newMeal = {
        ...meal,
        groups: meal.groups.filter((itemGroup) => itemGroup.id !== itemGroupId)
      }

      await mealRepository.updateMeal(dayId, mealId, newMeal)
    }
  }
}
