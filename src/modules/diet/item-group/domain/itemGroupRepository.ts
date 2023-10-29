import { DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { ItemGroup } from '@/src/modules/diet/item-group/domain/itemGroup'
import { Meal } from '@/src/modules/diet/meal/domain/meal'

// TODO: Make item group not a subcollection of day
export interface ItemGroupRepository {
  fetchMealItemGroups(
    dayId: DayDiet['id'],
    mealId: Meal['id'],
  ): Promise<readonly ItemGroup[]>
  insertItemGroup(
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    newItemGroup: ItemGroup,
  ): Promise<ItemGroup | undefined>
  updateItemGroup(
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ): Promise<ItemGroup | undefined>
  deleteItemGroup(
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    id: DayDiet['id'],
  ): Promise<void>
}
