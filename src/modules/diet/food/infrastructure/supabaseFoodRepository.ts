import supabase from '~/legacy/utils/supabase'
import { type Food, type NewFood } from '~/modules/diet/food/domain/food'
import {
  type FoodRepository,
  type FoodSearchParams,
} from '~/modules/diet/food/domain/foodRepository'
import {
  createFoodFromDAO,
  createInsertFoodDAOFromNewFood,
  foodDAOSchema,
} from '~/modules/diet/food/infrastructure/foodDAO'
import { handleApiError, wrapErrorWithStack } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

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

/**
 * Fetches a Food by its ID.
 * Throws on error or if not found.
 * @param id - The Food ID
 * @param params - Optional search params
 * @returns The Food
 * @throws Error if not found or on API/validation error
 */
async function fetchFoodById(
  id: Food['id'],
  params: Omit<FoodSearchParams, 'limit'> = {},
): Promise<Food> {
  try {
    const foods = await internalCachedSearchFoods(
      { field: 'id', value: id },
      { ...params, limit: 1 },
    )
    if (foods.length === 0 || foods[0] === undefined) {
      handleApiError('Food not found', {
        component: 'supabaseFoodRepository',
        operation: 'fetchFoodById',
        additionalData: { id, params },
      })
      throw new Error('Food not found')
    }
    return foods[0]
  } catch (err) {
    handleApiError(err, {
      component: 'supabaseFoodRepository',
      operation: 'fetchFoodById',
      additionalData: { id, params },
    })
    throw err
  }
}

/**
 * Fetches a Food by its EAN.
 * Throws on error or if not found.
 * @param ean - The Food EAN
 * @param params - Optional search params
 * @returns The Food
 * @throws Error if not found or on API/validation error
 */
async function fetchFoodByEan(
  ean: Required<Food>['ean'],
  params: Omit<FoodSearchParams, 'limit'> = {},
): Promise<Food> {
  try {
    const foods = await internalCachedSearchFoods(
      { field: 'ean', value: ean },
      { ...params, limit: 1 },
    )
    if (foods.length === 0 || foods[0] === undefined) {
      handleApiError('Food not found', {
        component: 'supabaseFoodRepository',
        operation: 'fetchFoodByEan',
        additionalData: { ean, params },
      })
      throw new Error('Food not found')
    }
    return foods[0]
  } catch (err) {
    handleApiError(err, {
      component: 'supabaseFoodRepository',
      operation: 'fetchFoodByEan',
      additionalData: { ean, params },
    })
    throw err
  }
}

/**
 * Inserts a new Food.
 * Throws on error or if not created.
 * @param newFood - The new Food
 * @returns The created Food
 * @throws Error if not created or on API/validation error
 */
async function insertFood(newFood: NewFood): Promise<Food> {
  const createDAO = createInsertFoodDAOFromNewFood(newFood)
  const { data, error } = await supabase
    .from(TABLE)
    .insert(createDAO)
    .select('*')
  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseFoodRepository',
      operation: 'insertFood',
      additionalData: { food: newFood },
    })
    throw wrapErrorWithStack(error)
  }
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  const foods = foodDAOs.map(createFoodFromDAO)
  if (foods.length === 0 || foods[0] === undefined) {
    handleApiError('Food not created', {
      component: 'supabaseFoodRepository',
      operation: 'insertFood',
      additionalData: { food: newFood },
    })
    throw new Error('Food not created')
  }
  return foods[0]
}

/**
 * Upserts a Food.
 * Throws on error or if not created.
 * @param newFood - The new Food
 * @returns The upserted Food
 * @throws Error if not created or on API/validation error
 */
async function upsertFood(newFood: NewFood): Promise<Food> {
  const createDAO = createInsertFoodDAOFromNewFood(newFood)
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(createDAO)
    .select('*')
  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseFoodRepository',
      operation: 'upsertFood',
      additionalData: { food: newFood },
    })
    throw wrapErrorWithStack(error)
  }
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  const foods = foodDAOs.map(createFoodFromDAO)
  if (foods.length === 0 || foods[0] === undefined) {
    handleApiError('Food not created', {
      component: 'supabaseFoodRepository',
      operation: 'upsertFood',
      additionalData: { food: newFood },
    })
    throw new Error('Food not created')
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
        ;((_: never) => _)(operator) // TODO:   Create a better function for exhaustive checks
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
      additionalData: { field, value, operator, params },
    })
    throw wrapErrorWithStack(error)
  }

  console.debug(`[Food] Found ${data.length} foods`)
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  return foodDAOs.map(createFoodFromDAO)
}
