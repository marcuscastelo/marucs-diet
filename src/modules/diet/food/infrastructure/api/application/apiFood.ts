import { type Food, foodSchema } from '~/modules/diet/food/domain/food'
import { type DbReady } from '~/legacy/utils/newDbRecord'
import { markSearchAsCached } from '~/legacy/controllers/searchCache'
import { type ApiFood } from '~/modules/diet/food/infrastructure/api/domain/apiFoodModel'
import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'
import { createSupabaseFoodRepository } from '~/modules/diet/food/infrastructure/supabaseFoodRepository'
import axios from 'axios'

// TODO: Depency injection for repositories on all application files
const foodRepository = createSupabaseFoodRepository()

// TODO: Move `convertApi2Food` to a more appropriate place
export function convertApi2Food(food: ApiFood): DbReady<Food> {
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

export async function importFoodFromApiByEan(
  ean: string,
): Promise<Food | null> {
  const apiFood = (await axios.get(`/api/food/ean/${ean}`))
    .data as unknown as ApiFood

  if (apiFood.id === 0) {
    console.debug(`[ApiFood] Food with EAN ${ean} not found`)
    return null
  }

  const food = convertApi2Food(apiFood)
  const insertedFood = await foodRepository.insertFood(food)
  return foodSchema.parse(insertedFood)
}

export async function importFoodsFromApiByName(name: string): Promise<Food[]> {
  console.debug(`[ApiFood] Importing foods with name "${name}"`)
  const apiFoods = (await axios.get(`/api/food/name/${name}`))
    .data as unknown as ApiFood[]

  if (apiFoods.length === 0) {
    console.debug(`[ApiFood] No foods found with name "${name}"`)
    return []
  }

  console.debug(`[ApiFood] Found ${apiFoods.length} foods`)
  const foodsToInsert = apiFoods.map(convertApi2Food)

  const insertPromises = foodsToInsert.map(foodRepository.insertFood)

  const insertionResults = await Promise.allSettled(insertPromises)
  console.debug(
    `[ApiFood] Inserted ${insertionResults.length} foods. ${
      insertionResults.filter((result) => result.status === 'fulfilled').length
    } succeeded, ${
      insertionResults.filter((result) => result.status === 'rejected').length
    } failed`,
  )

  if (insertionResults.some((result) => result.status === 'rejected')) {
    const allRejected = insertionResults.filter(
      (result) => result.status === 'rejected',
    )

    const reasons = allRejected.map((result) => result.reason)
    const errors = reasons.map((reason) => (reason as { code: string }).code)

    const ignoredErrors = [
      '23505', // Unique violation: food already exists, ignore
    ]

    if (errors.some((error) => !ignoredErrors.includes(error))) {
      console.error(
        `Failed to insert some foods: ${JSON.stringify(allRejected)}`,
      )
      throw new Error('Failed to insert some foods. See console for details.')
    }
  } else {
    console.debug('[ApiFood] No failed insertions, marking search as cached')
    await markSearchAsCached(name)
  }

  const insertedFoods: ReadonlyArray<Food | null> = insertionResults
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)

  console.debug(
    `[ApiFood] Returning ${insertedFoods.length}/${apiFoods.length} foods`,
  )

  return foodSchema.array().parse(insertedFoods)
}
