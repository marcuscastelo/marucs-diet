import { ApiFood } from '@/model/apiFoodModel'
import { Food, foodSchema } from '@/model/foodModel'
import { INTERNAL_API } from '@/utils/api'
import { New } from '@/utils/newDbRecord'
import { insertFood } from './food'
import { markSearchAsCached } from './searchCache'

// TODO: retriggered: pensar num lugar melhor pra isso
export function convertApi2Food(food: ApiFood): New<Food> {
  return {
    name: food.nome,
    source: {
      type: 'api',
      id: food.id.toString(),
    },
    ean: food.ean,
    macros: {
      carbs: food.carboidratos * 100,
      protein: food.proteinas * 100,
      fat: food.gordura * 100,
    },
  }
}

export async function importFoodFromApiByEan(ean: string): Promise<Food> {
  const apiFood = (await INTERNAL_API.get(`barcode/${ean}`)).data as ApiFood
  const food = convertApi2Food(apiFood)
  const insertedFood = await insertFood(food)
  return foodSchema.parse(insertedFood)
}

export async function importFoodsFromApiByName(name: string): Promise<Food[]> {
  const apiFoods = (await INTERNAL_API.get('food', { params: { q: name } }))
    .data as ApiFood[]

  const foodsToInsert = apiFoods.map(convertApi2Food)

  const insertPromises = foodsToInsert.map(insertFood)

  const insertionResults = await Promise.allSettled(insertPromises)

  if (insertionResults.some((result) => result.status === 'rejected')) {
    console.error(`Failed to insert some foods: ${insertionResults}`)
    throw new Error('Failed to insert some foods. See console for details.')
  }

  const insertedFoods: Food[] = insertionResults.map((result) =>
    result.status === 'fulfilled' ? result.value : (null as unknown as Food),
  )

  markSearchAsCached(name)

  return insertedFoods.map((food) => foodSchema.parse(food))
}
