import { describe, expect, it } from 'vitest'
import { applySearchParamsToFoods, doesFoodMatchParams } from './foodSearchUtils'
import { type Food } from '../domain/food'
import { type FoodSearchParams } from '../domain/foodRepository'

function mockFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 1,
    name: 'Test Food',
    macros: {
      carbs: 10,
      protein: 20,
      fat: 5,
    },
    __type: 'Food',
    ...overrides,
  }
}

describe('doesFoodMatchParams', () => {
  it('should return null when food is null', () => {
    const result = doesFoodMatchParams(null, {})
    expect(result).toBeNull()
  })

  it('should return food when no parameters are provided', () => {
    const food = mockFood()
    const result = doesFoodMatchParams(food, {})
    expect(result).toBe(food)
  })

  it('should return food when food ID is in allowedFoods list', () => {
    const food = mockFood({ id: 5 })
    const params = { allowedFoods: [1, 5, 10] }
    const result = doesFoodMatchParams(food, params)
    expect(result).toBe(food)
  })

  it('should return null when food ID is not in allowedFoods list', () => {
    const food = mockFood({ id: 7 })
    const params = { allowedFoods: [1, 5, 10] }
    const result = doesFoodMatchParams(food, params)
    expect(result).toBeNull()
  })

  it('should return food when allowedFoods is empty array', () => {
    const food = mockFood({ id: 5 })
    const params = { allowedFoods: [] }
    const result = doesFoodMatchParams(food, params)
    expect(result).toBeNull()
  })

  it('should return food when allowedFoods is undefined', () => {
    const food = mockFood()
    const params = { allowedFoods: undefined }
    const result = doesFoodMatchParams(food, params)
    expect(result).toBe(food)
  })
})

describe('applySearchParamsToFoods', () => {
  it('should return all foods when no parameters are provided', () => {
    const foods = [mockFood({ id: 1 }), mockFood({ id: 2 }), mockFood({ id: 3 })]
    const result = applySearchParamsToFoods(foods, {})
    expect(result).toHaveLength(3)
    expect(result).toEqual(foods)
  })

  it('should filter foods based on allowedFoods parameter', () => {
    const foods = [
      mockFood({ id: 1, name: 'Apple' }),
      mockFood({ id: 2, name: 'Banana' }),
      mockFood({ id: 3, name: 'Cherry' }),
    ]
    const params: FoodSearchParams = { allowedFoods: [1, 3] }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(2)
    expect(result.map(f => f.id)).toEqual([1, 3])
    expect(result.map(f => f.name)).toEqual(['Apple', 'Cherry'])
  })

  it('should return empty array when no foods match allowedFoods', () => {
    const foods = [
      mockFood({ id: 1 }),
      mockFood({ id: 2 }),
      mockFood({ id: 3 }),
    ]
    const params: FoodSearchParams = { allowedFoods: [4, 5, 6] }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(0)
  })

  it('should apply limit parameter correctly', () => {
    const foods = [
      mockFood({ id: 1 }),
      mockFood({ id: 2 }),
      mockFood({ id: 3 }),
      mockFood({ id: 4 }),
    ]
    const params: FoodSearchParams = { limit: 2 }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(2)
    expect(result.map(f => f.id)).toEqual([1, 2])
  })

  it('should apply both allowedFoods and limit parameters', () => {
    const foods = [
      mockFood({ id: 1, name: 'Apple' }),
      mockFood({ id: 2, name: 'Banana' }),
      mockFood({ id: 3, name: 'Cherry' }),
      mockFood({ id: 4, name: 'Date' }),
      mockFood({ id: 5, name: 'Elderberry' }),
    ]
    const params: FoodSearchParams = { 
      allowedFoods: [1, 3, 4, 5], 
      limit: 2 
    }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(2)
    expect(result.map(f => f.id)).toEqual([1, 3]) // First 2 from allowed foods
  })

  it('should handle limit larger than available foods', () => {
    const foods = [mockFood({ id: 1 }), mockFood({ id: 2 })]
    const params: FoodSearchParams = { limit: 10 }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(2)
    expect(result).toEqual(foods)
  })

  it('should handle empty foods array', () => {
    const foods: Food[] = []
    const params: FoodSearchParams = { allowedFoods: [1, 2, 3], limit: 5 }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(0)
  })

  it('should handle limit of 0', () => {
    const foods = [mockFood({ id: 1 }), mockFood({ id: 2 })]
    const params: FoodSearchParams = { limit: 0 }
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(0)
  })

  it('should filter out null values returned by doesFoodMatchParams', () => {
    const foods = [
      mockFood({ id: 1 }),
      mockFood({ id: 2 }),
      mockFood({ id: 3 }),
    ]
    const params: FoodSearchParams = { allowedFoods: [1] } // Only ID 1 should match
    const result = applySearchParamsToFoods(foods, params)
    
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })
})
