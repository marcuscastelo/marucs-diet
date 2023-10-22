import { Day } from '@/modules/diet/day/domain/day'
import { ItemGroup } from '@/src/modules/diet/item-group/domain/itemGroup'
import { Meal } from '@/src/modules/diet/meal/domain/meal'

// TODO: Make item group not a subcollection of day
export interface ItemGroupRepository {
  fetchMealItemGroups(
    dayId: Day['id'],
    mealId: Meal['id'],
  ): Promise<readonly ItemGroup[]>
  insertItemGroup(
    dayId: Day['id'],
    mealId: Meal['id'],
    newItemGroup: ItemGroup,
  ): Promise<ItemGroup | undefined>
  updateItemGroup(
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ): Promise<ItemGroup | undefined>
  deleteItemGroup(
    dayId: Day['id'],
    mealId: Meal['id'],
    id: Day['id'],
  ): Promise<void>
}
