import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { type ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '@/modules/diet/meal/domain/meal'

// TODO: Make item group not a subcollection of day
export type ItemGroupRepository = {
  fetchMealItemGroups: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
  ) => Promise<readonly ItemGroup[]>
  insertItemGroup: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    newItemGroup: ItemGroup,
  ) => Promise<ItemGroup | undefined>
  updateItemGroup: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ) => Promise<ItemGroup | undefined>
  deleteItemGroup: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    id: DayDiet['id'],
  ) => Promise<void>
}
