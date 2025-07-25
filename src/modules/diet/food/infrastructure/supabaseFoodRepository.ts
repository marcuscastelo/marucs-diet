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
import {
  createErrorHandler,
  wrapErrorWithStack,
} from '~/shared/error/errorHandler'
import { isSupabaseDuplicateEanError } from '~/shared/supabase/supabaseErrorUtils'
import { createDebug } from '~/shared/utils/createDebug'
import { parseWithStack } from '~/shared/utils/parseWithStack'
import supabase from '~/shared/utils/supabase'

const debug = createDebug()
const errorHandler = createErrorHandler('infrastructure', 'Food')

const TABLE = 'foods'

export function createSupabaseFoodRepository(): FoodRepository {
  return {
    fetchFoods,
    fetchFoodById,
    fetchFoodsByName,
    fetchFoodByEan,
    insertFood,
    upsertFood,
    fetchFoodsByIds,
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
      errorHandler.error(new Error('Food not found'))
      throw new Error('Food not found')
    }
    return foods[0]
  } catch (err) {
    errorHandler.error(err)
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
      errorHandler.error(new Error('Food not found'))
      throw new Error('Food not found')
    }
    return foods[0]
  } catch (err) {
    errorHandler.error(err)
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
    if (isSupabaseDuplicateEanError(error, newFood.ean)) {
      return await fetchFoodByEan(newFood.ean)
    }
    errorHandler.error(error)
    throw wrapErrorWithStack(error)
  }
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  const foods = foodDAOs.map(createFoodFromDAO)
  if (foods.length === 0 || foods[0] === undefined) {
    errorHandler.error(new Error('Food not created'))
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
    if (isSupabaseDuplicateEanError(error, newFood.ean)) {
      return await fetchFoodByEan(newFood.ean)
    }
    errorHandler.error(error)
    throw wrapErrorWithStack(error)
  }
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  const foods = foodDAOs.map(createFoodFromDAO)
  if (foods.length === 0 || foods[0] === undefined) {
    errorHandler.error(new Error('Food not created'))
    throw new Error('Food not created')
  }
  return foods[0]
}

async function fetchFoodsByName(
  name: Required<Food>['name'],
  params: FoodSearchParams = {},
) {
  try {
    // Use optimized favorites search if userId and isFavoritesSearch are provided
    const { userId, isFavoritesSearch, limit = 50 } = params

    let result
    if (isFavoritesSearch === true && userId !== undefined) {
      // Search within favorites only using optimized RPC
      result = await supabase.rpc('search_favorite_foods_with_scoring', {
        p_user_id: userId,
        p_search_term: name,
        p_limit: limit,
      })
    } else {
      // Use standard search for all foods
      result = await supabase.rpc('search_foods_with_scoring', {
        p_search_term: name,
        p_limit: limit,
      })
    }

    if (result.error !== null) {
      errorHandler.error(result.error)
      throw wrapErrorWithStack(result.error)
    }

    if (result.data === null || result.data === undefined) {
      debug('No data returned from enhanced search')
      return []
    }

    const searchType =
      isFavoritesSearch === true && userId !== undefined
        ? 'favorites search'
        : 'enhanced search'
    debug(
      `Found ${Array.isArray(result.data) ? result.data.length : 0} foods using ${searchType}`,
    )
    const foodDAOs = parseWithStack(foodDAOSchema.array(), result.data)
    return foodDAOs.map(createFoodFromDAO)
  } catch (err) {
    errorHandler.error(err)
    throw err
  }
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
        field: 'ean' | 'id' | 'name'
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
  debug(
    `Searching for foods with ${field} = ${value} (limit: ${
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
    const normalizedValue = value
    switch (operator) {
      case 'eq':
        query = query.eq(field, normalizedValue)
        break
      case 'ilike':
        query = query.ilike(field, `%${normalizedValue}%`)
        break
      default:
        ;((_: never) => _)(operator) // TODO:   Create a better function for exhaustive checks
    }
  }

  if (allowedFoods !== undefined) {
    debug('Limiting search to allowed foods')
    query = query.in('id', allowedFoods)
  }

  if (limit !== undefined) {
    debug(`Limiting search to ${limit} results`)
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error !== null) {
    errorHandler.error(error)
    throw wrapErrorWithStack(error)
  }

  debug(`Found ${data.length} foods`)
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  return foodDAOs.map(createFoodFromDAO)
}

/**
 * Fetches foods by an array of IDs.
 * @param ids - Array of Food IDs.
 * @returns Array of foods matching the IDs.
 */
async function fetchFoodsByIds(ids: Food['id'][]): Promise<readonly Food[]> {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const { data, error } = await supabase.from(TABLE).select('*').in('id', ids)
  if (error !== null) {
    errorHandler.error(error)
    throw wrapErrorWithStack(error)
  }
  const foodDAOs = parseWithStack(foodDAOSchema.array(), data)
  return foodDAOs.map(createFoodFromDAO)
}
