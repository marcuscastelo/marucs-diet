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

/**
 * Apply search parameters to a list of foods
 */
function applySearchParamsToFoods(foods: Food[], params: FoodSearchParams): Food[] {
  // Filter foods using the same logic as single food filtering
  let filteredFoods = foods
    .map(food => doesFoodMatchParams(food, params))
    .filter((food): food is Food => food !== null)
  
  // Apply limit if specified
  if (params.limit) {
    filteredFoods = filteredFoods.slice(0, params.limit)
  }
  
  return filteredFoods
}

/**
 * Check if a food matches the search parameters (for single food filtering)
 */
function doesFoodMatchParams(food: Food | null, params: Omit<FoodSearchParams, 'limit'>): Food | null {
  if (!food) return null
  
  if (params.allowedFoods && !params.allowedFoods.includes(food.id)) {
    return null // Food not in allowed list
  }
  
  return food
}

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
    
    toast.loading('Importando alimentos...')
    
    try {
      const importedFoods = await importFoodsFromApiByName(name)
      toast.success('Alimentos importados com sucesso')
      
      // Apply search parameters to imported foods if needed
      const filteredFoods = applySearchParamsToFoods(importedFoods, params)
      
      return filteredFoods
    } catch (error) {
      const errorMessage = `Erro ao importar alimentos: ${(error as Error)?.message || error}`
      toast.error(errorMessage)
      throw error
    }
  }
  return await foodRepository.fetchFoodsByName(name, params)
}

export async function fetchFoodByEan(
  ean: Required<Food>['ean'],
  params: Omit<FoodSearchParams, 'limit'> = {},
) {
  if (!(await isEanCached(ean))) {
    console.debug(`[Food] Food with EAN ${ean} not cached, importing`)
    
    toast.loading('Importando alimento...')
    
    try {
      const importedFood = await importFoodFromApiByEan(ean)
      toast.success('Alimento importado com sucesso')
      
      // Apply search parameters to imported food if needed
      const food = doesFoodMatchParams(importedFood, params)
      
      return food
    } catch (error) {
      const errorMessage = `Erro ao importar alimento: ${(error as Error)?.message || error}`
      toast.error(errorMessage)
      throw error
    }
  }
  return await foodRepository.fetchFoodByEan(ean, params)
}

export async function isEanCached(ean: Required<Food>['ean']) {
  const cached = (await foodRepository.fetchFoodByEan(ean, {})) !== null
  console.debug(`[Food] EAN ${ean} cached: ${cached}`)
  return cached
}
