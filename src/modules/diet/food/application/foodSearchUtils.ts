import { type Food } from '../domain/food'
import { type FoodSearchParams } from '../domain/foodRepository'

/**
 * Apply search parameters to a list of foods
 */
export function applySearchParamsToFoods(foods: Food[], params: FoodSearchParams): Food[] {
  // Filter foods using the same logic as single food filtering
  let filteredFoods = foods
    .map(food => doesFoodMatchParams(food, params))
    .filter((food): food is Food => food !== null)
  
  // Apply limit if specified (including 0)
  if (params.limit !== undefined) {
    filteredFoods = filteredFoods.slice(0, params.limit)
  }
  
  return filteredFoods
}

/**
 * Check if a food matches the search parameters (for single food filtering)
 */
export function doesFoodMatchParams(food: Food | null, params: Omit<FoodSearchParams, 'limit'>): Food | null {
  if (!food) return null
  
  if (params.allowedFoods && !params.allowedFoods.includes(food.id)) {
    return null // Food not in allowed list
  }
  
  return food
}
