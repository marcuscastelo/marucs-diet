import { type Food, foodSchema, type NewFood } from '~/modules/diet/food/domain/food'
import supabase from '~/legacy/utils/supabase'
import {
  type FoodRepository,
  type FoodSearchParams,
} from '~/modules/diet/food/domain/foodRepository'
import {
  createFoodFromDAO,
  foodDAOSchema,
  createInsertFoodDAOFromNewFood,
} from '~/modules/diet/food/infrastructure/foodDAO'
import { handleApiError, logError } from '~/shared/error/errorHandler'

const TABLE = 'foods'

export function createSupabaseFoodRepository(): FoodRepository {
  return {
    fetchFoods,
    fetchFoodById,
    fetchFoodsByName,
    fetchFoodByEan,
    insertFood,
    upsertFood,
  }
}

async function fetchFoodById(
  id: Food['id'],
  params: Omit<FoodSearchParams, 'limit'> = {},
) {
  const foods = await internalCachedSearchFoods(
    { field: 'id', value: id },
    { ...params, limit: 1 },
  )

  if (foods.length === 0) {
    logError(`Food with id ${id} not found`, {
      component: 'supabaseFoodRepository',
      operation: 'fetchFoodById',
      additionalData: { id, params }
    })
    return null
  }

  return foods[0]
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
  params: Omit<FoodSearchParams, 'limit'> = {},
) {
  const foods = await internalCachedSearchFoods(
    { field: 'ean', value: ean },
    { ...params, limit: 1 },
  )
  return foods[0] ?? null
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
): Promise<readonly Food[]> {
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
    handleApiError(error, {
      component: 'supabaseFoodRepository',
      operation: 'internalCachedSearchFoods',
      additionalData: { field, value, operator, params }
    })
    throw error
  }

  console.debug(`[Food] Found ${data?.length ?? 0} foods`)
  const foodDAOs = foodDAOSchema.array().parse(data ?? [])
  return foodDAOs.map(createFoodFromDAO)
}

async function insertFood(newFood: NewFood): Promise<Food | null> {
  const createDAO = createInsertFoodDAOFromNewFood(newFood)

  const { data, error } = await supabase.from(TABLE).insert(createDAO).select('*')
  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseFoodRepository',
      operation: 'insertFood',
      additionalData: { food: newFood }
    })
    throw error
  }

  const foodDAOs = foodDAOSchema.array().parse(data ?? [])
  const foods = foodDAOs.map(createFoodFromDAO)

  return foods[0] ?? null
}

async function upsertFood(newFood: NewFood): Promise<Food | null> {
  const createDAO = createInsertFoodDAOFromNewFood(newFood)

  const { data, error } = await supabase.from(TABLE).upsert(createDAO).select('*')

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseFoodRepository',
      operation: 'upsertFood',
      additionalData: { food: newFood }
    })
    throw error
  }

  const foodDAOs = foodDAOSchema.array().parse(data ?? [])
  const foods = foodDAOs.map(createFoodFromDAO)

  return foods[0] ?? null
}
