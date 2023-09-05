import { Food, foodSchema } from '@/model/foodModel'
import { New, enforceNew } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'
import { isEanCached } from './eanCache'
import { importFoodFromApiByEan, importFoodsFromApiByName } from './apiFood'
import { isSearchCached } from './searchCache'

const TABLE = 'foods'

export type TemplateSearchParams = {
  limit?: number
  allowedFoods?: number[]
}

export async function searchFoodById(
  id: Food['id'],
  params: TemplateSearchParams = {},
) {
  const [food] = await internalCachedSearchFoods(
    { field: 'id', value: id },
    params,
  )
  return food
}

export async function searchFoodsByName(
  name: Required<Food>['name'],
  params: TemplateSearchParams = {},
) {
  console.debug(`[Food] Searching for food with name ${name}`)
  if (!(await isSearchCached(name))) {
    console.debug(`[Food] Food with name ${name} not cached, importing`)
    await importFoodsFromApiByName(name)
  }
  console.debug(`[Food] Food with name ${name} cached, searching`)
  return await internalCachedSearchFoods(
    { field: 'name', value: name, operator: 'ilike' },
    params,
  )
}

export async function searchFoodsByEan(
  ean: Required<Food>['ean'],
  params: TemplateSearchParams = {},
) {
  console.debug(`[Food] Searching for food with EAN ${ean}`)
  if (!(await isEanCached(ean))) {
    await importFoodFromApiByEan(ean)
  }
  const [food] = await internalCachedSearchFoods(
    { field: 'ean', value: ean },
    params,
  )
  return food
}

export async function listFoods(params: TemplateSearchParams = {}) {
  return await internalCachedSearchFoods({ field: '', value: '' }, params)
}

// TODO: Favorites on top? other function for that?
async function internalCachedSearchFoods(
  {
    field,
    value,
    operator = 'eq',
  }:
    | {
        field: keyof Food
        value: Food[keyof Food]
        operator?: 'eq' | 'ilike'
      }
    | {
        field: ''
        value: ''
        operator?: 'eq' | 'ilike'
      },
  params?: TemplateSearchParams,
): Promise<Food[]> {
  console.debug(
    `[Food] Searching for foods with ${field} = ${value} (limit: ${
      params?.limit ?? 'none'
    })`,
  )
  const { limit, allowedFoods } = params ?? {}
  const base = supabase.from(TABLE).select('*')

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

  if (allowedFoods) {
    console.debug(`[Food] Limiting search to allowed foods`)
    query = query.in('id', allowedFoods)
  }

  if (limit) {
    console.debug(`[Food] Limiting search to ${limit} results`)
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) {
    console.error(error)
    throw error
  }

  console.debug(`[Food] Found ${data?.length ?? 0} foods`)
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
