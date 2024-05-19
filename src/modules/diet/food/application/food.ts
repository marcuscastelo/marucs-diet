import toast from 'solid-toast'
import { isSearchCached } from '~/legacy/controllers/searchCache'
import { type Food } from '~/modules/diet/food/domain/food'
import { type FoodSearchParams } from '~/modules/diet/food/domain/foodRepository'
import {
  importFoodFromApiByEan,
  importFoodsFromApiByName,
} from '~/modules/diet/food/infrastructure/api/application/apiFood'
import { createSupabaseFoodRepository } from '~/modules/diet/food/infrastructure/supabaseFoodRepository'

const foodRepository = createSupabaseFoodRepository()

export async function fetchFoods(params: FoodSearchParams = {}) {
  return await foodRepository.fetchFoods(params)
}

export async function fetchFoodById(
  id: Food['id'],
  params: FoodSearchParams = {},
) {
  return await foodRepository.fetchFoodById(id, params)
}

export async function fetchFoodsByName(
  name: Required<Food>['name'],
  params: FoodSearchParams = {},
) {
  if (!(await isSearchCached(name))) {
    console.debug(`[Food] Food with name ${name} not cached, importing`)
    await toast.promise(importFoodsFromApiByName(name), {
      loading: 'Importando alimentos...',
      success: 'Alimentos importados com sucesso',
      error: 'Error ao importar alimentos',
    })
  }
  // TODO: When importing a food, avoid second fetch for performance
  return await foodRepository.fetchFoodsByName(name, params)
}

export async function fetchFoodByEan(
  ean: Required<Food>['ean'],
  params: Omit<FoodSearchParams, 'limit'> = {},
) {
  if (!(await isEanCached(ean))) {
    console.debug(`[Food] Food with EAN ${ean} not cached, importing`)
    return await toast.promise(importFoodFromApiByEan(ean), {
      loading: 'Importando alimento...',
      success: 'Alimento importado com sucesso',
      error: 'Error ao importar alimento',
    })
  }
  // TODO: When importing a food, avoid second fetch for performance
  return await foodRepository.fetchFoodByEan(ean, params)
}

export async function isEanCached(ean: Required<Food>['ean']) {
  const cached = (await foodRepository.fetchFoodByEan(ean, {})) !== null
  console.debug(`[Food] EAN ${ean} cached: ${cached}`)
  return cached
}
