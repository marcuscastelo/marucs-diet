import { type Food, type NewFood } from '~/modules/diet/food/domain/food'

export type FoodSearchParams = {
  limit?: number
  allowedFoods?: number[]
}

export type FoodRepository = {
  /**
   * Fetches foods by an array of IDs.
   * @param ids - Array of Food IDs.
   * @returns Array of foods matching the IDs.
   */
  fetchFoodsByIds: (ids: Food['id'][]) => Promise<readonly Food[]>
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
  upsertFood: (newFood: NewFood) => Promise<Food | null>
}
