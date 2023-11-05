import { type DbReady } from '~/legacy/utils/newDbRecord'
import { type Food } from '~/modules/diet/food/domain/food'

export type FoodSearchParams = {
  limit?: number
  allowedFoods?: number[]
}

export type FoodRepository = {
  fetchFoods: (params: FoodSearchParams) => Promise<readonly Food[]>
  fetchFoodById: (id: Food['id'], params: FoodSearchParams) => Promise<Food>
  fetchFoodsByName: (
    name: Required<Food>['name'],
    params: FoodSearchParams,
  ) => Promise<readonly Food[]>
  fetchFoodByEan: (
    ean: Required<Food>['ean'],
    params: FoodSearchParams,
  ) => Promise<Food>

  insertFood: (newFood: DbReady<Food>) => Promise<Food | null>
}
