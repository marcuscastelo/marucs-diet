import { isSearchCached } from '~/legacy/controllers/searchCache'
import { type Food } from '~/modules/diet/food/domain/food'
import { type FoodSearchParams } from '~/modules/diet/food/domain/foodRepository'
import {
  importFoodFromApiByEan,
  importFoodsFromApiByName,
} from '~/modules/diet/food/infrastructure/api/application/apiFood'
import { createSupabaseFoodRepository } from '~/modules/diet/food/infrastructure/supabaseFoodRepository'
import { showPromise } from '~/modules/toast/application/toastManager'
import { handleApiError } from '~/shared/error/errorHandler'
import { formatError } from '~/shared/formatError'

const foodRepository = createSupabaseFoodRepository()

export async function fetchFoods(params: FoodSearchParams = {}) {
  try {
    return await foodRepository.fetchFoods(params)
  } catch (error) {
    handleApiError(error, {
      component: 'foodApplication',
      operation: 'fetchFoods',
      additionalData: { params },
    })
    throw error
  }
}

export async function fetchFoodById(
  id: Food['id'],
  params: FoodSearchParams = {},
) {
  console.debug(`[Food] Fetching food by id: ${id}`)
  try {
    return await foodRepository.fetchFoodById(id, params)
  } catch (error) {
    handleApiError(error, {
      component: 'foodApplication',
      operation: 'fetchFoodById',
      additionalData: { id, params },
    })
    throw error
  }
}

export async function fetchFoodsByName(
  name: Required<Food>['name'],
  params: FoodSearchParams = {},
) {
  console.debug(`[Food] Fetching foods by name: ${name}`)
  if (!(await isSearchCached(name))) {
    console.debug(`[Food] Food with name ${name} not cached, importing`)
    await showPromise(
      importFoodsFromApiByName(name),
      {
        loading: 'Importando alimentos...',
        success: 'Alimentos importados com sucesso',
        error: 'Erro ao importar alimentos',
      },
      { context: 'background' },
    )
  }
  return await showPromise(
    foodRepository.fetchFoodsByName(name, params),
    {
      loading: 'Buscando alimentos por nome...',
      success: 'Alimentos encontrados',
      error: (error: unknown) =>
        `Erro ao buscar alimentos por nome: ${formatError(error)}`,
    },
    {
      audience: 'system',
    },
  )
}

export async function fetchFoodByEan(
  ean: string,
  params: Omit<FoodSearchParams, 'limit'> = {},
) {
  console.debug(`[Food] Fetching food by EAN: ${ean}`)
  await showPromise(
    importFoodFromApiByEan(ean),
    {
      loading: 'Importando alimento...',
      success: 'Alimento importado com sucesso',
      error: 'Erro ao importar alimento',
    },
    { context: 'background' },
  )
  return await showPromise(foodRepository.fetchFoodByEan(ean, params), {
    loading: 'Buscando alimento por EAN...',
    success: 'Alimento encontrado',
    error: (error: unknown) =>
      `Erro ao buscar alimento por EAN: ${formatError(error)}`,
  })
}

export async function isEanCached(ean: Required<Food>['ean']) {
  try {
    const cached = (await foodRepository.fetchFoodByEan(ean, {})) !== null
    console.debug(`[Food] EAN ${ean} cached: ${cached}`)
    return cached
  } catch (error) {
    handleApiError(error, {
      component: 'foodApplication',
      operation: 'isEanCached',
      additionalData: { ean },
    })
    // Return false as default for caching check failure
    return false
  }
}
