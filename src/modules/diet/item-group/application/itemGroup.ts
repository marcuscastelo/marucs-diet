import { dayDiets } from '@/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { createSupabaseDayRepository } from '@/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { type ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { createDerivedItemGroupRepository } from '@/modules/diet/item-group/infrastructure/derivedItemGroupRepository'
import { type Meal } from '@/modules/diet/meal/domain/meal'
import { createDerivedMealRepository } from '@/modules/diet/meal/infrastructure/derivedMealRepository'

const dayRepository = createSupabaseDayRepository()
const mealRepository = createDerivedMealRepository(dayDiets, dayRepository)
const itemGroupRepository = createDerivedItemGroupRepository(
  dayDiets,
  mealRepository
)

export async function insertItemGroup (
  dayId: DayDiet['id'],
  mealId: Meal['id'],
  newItemGroup: ItemGroup
) {
  return await itemGroupRepository.insertItemGroup(dayId, mealId, newItemGroup)
}

export async function updateItemGroup (
  dayId: DayDiet['id'],
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
  newItemGroup: ItemGroup
) {
  return await itemGroupRepository.updateItemGroup(
    dayId,
    mealId,
    itemGroupId,
    newItemGroup
  )
}

export async function deleteItemGroup (
  dayId: DayDiet['id'],
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id']
) {
  await itemGroupRepository.deleteItemGroup(dayId, mealId, itemGroupId)
}
