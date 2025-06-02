import { type Food, type NewFood } from '~/modules/diet/food/domain/food'

export type FoodSearchParams = {
  limit?: number
  allowedFoods?: number[]
}

export type FoodRepository = {
  fetchFoods: (params: FoodSearchParams) => Promise<readonly Food[]>
  fetchFoodById: (
    id: Food['id'],
    params: Omit<FoodSearchParams, 'limit'>,
  ) => Promise<Food | null>
  fetchFoodsByName: (
    name: Required<Food>['name'],
    params: FoodSearchParams,
  ) => Promise<readonly Food[]>
  fetchFoodByEan: (
    ean: Required<Food>['ean'],
    params: Omit<FoodSearchParams, 'limit'>,
  ) => Promise<Food | null>

  insertFood: (newFood: NewFood) => Promise<Food | null>
}
