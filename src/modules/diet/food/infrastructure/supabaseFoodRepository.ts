import { type Food, foodSchema } from '~/modules/diet/food/domain/food'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import {
  type FoodRepository,
  type FoodSearchParams,
} from '~/modules/diet/food/domain/foodRepository'

const TABLE = 'foods'

export function createSupabaseFoodRepository(): FoodRepository {
  return {
    fetchFoods,
    fetchFoodById,
    fetchFoodsByName,
    fetchFoodByEan,
    insertFood,
  }
}

async function fetchFoodById(id: Food['id'], params: FoodSearchParams = {}) {
  const [food] = await internalCachedSearchFoods(
    { field: 'id', value: id },
    params,
  )
  return food
}

async function fetchFoodsByName(
  name: Required<Food>['name'],
  params: FoodSearchParams = {},
) {
  return await internalCachedSearchFoods(
    { field: 'name', value: name, operator: 'ilike' },
    params,
  )
}

async function fetchFoodByEan(
  ean: Required<Food>['ean'],
  params: FoodSearchParams = {},
) {
  const [food] = await internalCachedSearchFoods(
    { field: 'ean', value: ean },
    params,
  )
  return food
}

async function fetchFoods(params: FoodSearchParams = {}) {
  return await internalCachedSearchFoods({ field: '', value: '' }, params)
}

async function internalCachedSearchFoods(
  {
    field,
    value,
    operator = 'eq',
  }:
    | {
        field: keyof Food
        value: Food['ean' | 'id' | 'name']
        operator?: 'eq' | 'ilike'
      }
    | {
        field: ''
        value: ''
        operator?: 'eq' | 'ilike'
      },
  params?: FoodSearchParams,
): Promise<Food[]> {
  console.debug(
    `[Food] Searching for foods with ${field} = ${value} (limit: ${
      params?.limit ?? 'none'
    })`,
  )
  const { limit, allowedFoods } = params ?? {}
  const base = supabase
    .from(TABLE)
    .select('*')
    .not('name', 'eq', '')
    .not('name', 'eq', '.')
    .order('name', { ascending: true })

  let query = base

  if (field !== '' && value !== '') {
    console.debug(`[Food] Searching for foods with ${field} = ${value}`)

    switch (operator) {
      case 'eq':
        query = query.eq(field, value)
        break
      case 'ilike':
        query = query.ilike(field, `%${value}%`)
        break
      default:
        ;((_: never) => _)(operator) // TODO: Create a better function for exhaustive checks
    }
  }

  if (allowedFoods !== undefined) {
    console.debug('[Food] Limiting search to allowed foods')
    query = query.in('id', allowedFoods)
  }

  if (limit !== undefined) {
    console.debug(`[Food] Limiting search to ${limit} results`)
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error !== null) {
    console.error(error)
    throw error
  }

  console.debug(`[Food] Found ${data?.length ?? 0} foods`)
  return foodSchema.array().parse(data ?? [])
}

async function insertFood(newFood: DbReady<Food>): Promise<Food> {
  const food = enforceDbReady(newFood)

  const { data, error } = await supabase.from(TABLE).insert(food).select('*')
  if (error !== null) {
    console.error(error)
    throw error
  }

  return foodSchema.parse(data?.[0] ?? {})
}
