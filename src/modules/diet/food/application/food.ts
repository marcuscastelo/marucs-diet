import { isSearchCached } from '~/legacy/controllers/searchCache'
import { type Food } from '~/modules/diet/food/domain/food'
import { type FoodSearchParams } from '~/modules/diet/food/domain/foodRepository'
import {
  importFoodFromApiByEan,
  importFoodsFromApiByName,
} from '~/modules/diet/food/infrastructure/api/application/apiFood'
import { createSupabaseFoodRepository } from '~/modules/diet/food/infrastructure/supabaseFoodRepository'
import { smartToastPromise } from '~/shared/toast'
import { formatError } from '~/shared/formatError'

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
    await smartToastPromise(importFoodsFromApiByName(name), {
      context: 'background',
      loading: 'Importando alimentos...',
      success: 'Alimentos importados com sucesso',
      error: (error: unknown) =>
        `Erro ao importar alimentos: ${formatError(error)}`,
    })
  }

  return await smartToastPromise(
    foodRepository.fetchFoodsByName(name, params),
    {
      context: 'user-action',
      loading: 'Buscando alimentos por nome...',
      success: 'Alimentos encontrados',
      error: (error: unknown) =>
        `Erro ao buscar alimentos por nome: ${formatError(error)}`,
    },
  )
}

export async function fetchFoodByEan(
  ean: string,
  params: Omit<FoodSearchParams, 'limit'> = {},
) {
  if (!(await isEanCached(ean))) {
    console.debug(`[Food] Food with EAN ${ean} not cached, importing`)
    await smartToastPromise(importFoodFromApiByEan(ean), {
      context: 'background',
      loading: 'Importando alimento...',
      success: 'Alimento importado com sucesso',
      error: (error: unknown) =>
        `Erro ao importar alimento: ${formatError(error)}`,
    })
  }

  return await smartToastPromise(foodRepository.fetchFoodByEan(ean, params), {
    context: 'user-action',
    loading: 'Buscando alimento por EAN...',
    success: 'Alimento encontrado',
    error: (error: unknown) =>
      `Erro ao buscar alimento por EAN: ${formatError(error)}`,
  })
}

export async function isEanCached(ean: Required<Food>['ean']) {
  const cached = (await foodRepository.fetchFoodByEan(ean, {})) !== null
  console.debug(`[Food] EAN ${ean} cached: ${cached}`)
  return cached
}
