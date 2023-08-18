import { Food, foodSchema } from '@/model/foodModel'
import { New, enforceNew } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'
import { forEachLeadingCommentRange } from 'typescript'
import { isEanCached } from './eanCache'
import { mockFood } from '@/app/test/unit/(mock)/mockData'
import { importFoodFromApiByEan, importFoodsFromApiByName } from './apiFood'
import { isSearchCached } from './searchCache'

const TABLE = 'foods'

export type FoodSearchParams = {
  limit?: number
}

export async function searchFoodById(
  id: Food['id'],
  params: FoodSearchParams = {},
) {
  const [food] = await internalSearchFoods({ field: 'id', value: id }, params)
  return food
}

export async function searchFoodsByName(
  name: Required<Food>['name'],
  params: FoodSearchParams = {},
) {
  if (!(await isSearchCached(name))) {
    await importFoodsFromApiByName(name)
  }
  return await internalSearchFoods({ field: 'name', value: name }, params)
}

export async function searchFoodsByEan(
  ean: Required<Food>['ean'],
  params: FoodSearchParams = {},
) {
  if (!(await isEanCached(ean))) {
    await importFoodFromApiByEan(ean)
  }
  const [food] = await internalSearchFoods({ field: 'ean', value: ean }, params)
  return food
}

export async function listFoods(params: FoodSearchParams = {}) {
  return await internalSearchFoods({ field: '', value: '' }, params)
}

// TODO: Favorites on top? other function for that?
async function internalSearchFoods(
  {
    field,
    value,
  }:
    | {
        field: keyof Food
        value: Food[keyof Food]
      }
    | {
        field: ''
        value: ''
      },
  params?: FoodSearchParams,
): Promise<Food[]> {
  const { limit } = params ?? {}
  const base = supabase.from(TABLE).select('*')

  let query = base

  if (field !== '' && value !== '') {
    query = query.eq(field, value)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) {
    console.error(error)
    throw error
  }

  return foodSchema.array().parse(data ?? [])
}

export async function insertFood(newFood: New<Food>): Promise<Food> {
  const food = enforceNew(newFood)

  const { data, error } = await supabase.from(TABLE).insert(food).select('*')
  if (error) {
    console.error(error)
    throw error
  }

  return foodSchema.parse(data?.[0] ?? {})
}
