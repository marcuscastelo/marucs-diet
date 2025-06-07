import {
  type Food,
  type NewFood,
  createNewFood,
} from '~/modules/diet/food/domain/food'
import { markSearchAsCached } from '~/modules/search/application/searchCache'
import { type ApiFood } from '~/modules/diet/food/infrastructure/api/domain/apiFoodModel'
import { createSupabaseFoodRepository } from '~/modules/diet/food/infrastructure/supabaseFoodRepository'
import { handleApiError } from '~/shared/error/errorHandler'
import { showError } from '~/modules/toast/application/toastManager'
import axios from 'axios'

// TODO:   Depency injection for repositories on all application files
const foodRepository = createSupabaseFoodRepository()

// TODO:   Move `convertApi2Food` to a more appropriate place
export function convertApi2Food(food: ApiFood): NewFood {
  return createNewFood({
    name: food.nome,
    source: {
      type: 'api',
      id: food.id.toString(),
    },
    ean: food.ean === '' ? null : food.ean, // Convert EAN to null if not provided
    macros: {
      carbs: food.carboidratos * 100,
      protein: food.proteinas * 100,
      fat: food.gordura * 100,
    },
  })
}

export async function importFoodFromApiByEan(
  ean: string,
): Promise<Food | null> {
  const apiFood = (await axios.get(`/api/food/ean/${ean}`))
    .data as unknown as ApiFood

  if (apiFood.id === 0) {
    handleApiError(
      new Error(`Food with ean ${ean} not found on external api`),
      {
        component: 'apiFood',
        operation: 'importFoodFromApiByEan',
        additionalData: { ean },
      },
    )
    return null
  }

  const food = convertApi2Food(apiFood)
  const upsertedFood = await foodRepository.upsertFood(food)
  return upsertedFood
}

export async function importFoodsFromApiByName(name: string): Promise<Food[]> {
  console.debug(`[ApiFood] Importing foods with name "${name}"`)
  const apiFoods = (await axios.get(`/api/food/name/${name}`))
    .data as unknown as ApiFood[]

  if (apiFoods.length === 0) {
    showError(`Nenhum alimento encontrado para "${name}"`)
    return []
  }

  console.debug(`[ApiFood] Found ${apiFoods.length} foods`)
  const foodsToupsert = apiFoods.map(convertApi2Food)

  const upsertPromises = foodsToupsert.map(foodRepository.upsertFood)

  const upsertionResults = await Promise.allSettled(upsertPromises)
  console.debug(
    `[ApiFood] upserted ${upsertionResults.length} foods. ${
      upsertionResults.filter((result) => result.status === 'fulfilled').length
    } succeeded, ${
      upsertionResults.filter((result) => result.status === 'rejected').length
    } failed`,
  )

  if (upsertionResults.some((result) => result.status === 'rejected')) {
    const allRejected = upsertionResults.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )

    type Reason = { code: string }
    const reasons = allRejected.map((result) => {
      const reason: unknown = result.reason
      if (typeof reason === 'object' && reason !== null && 'code' in reason) {
        return reason as Reason
      }
      return { code: 'unknown' }
    })
    const errors = reasons.map((reason) => reason.code)

    const ignoredErrors = [
      '23505', // Unique violation: food already exists, ignore
    ]

    const relevantErrors = errors.filter(
      (error) => !ignoredErrors.includes(error),
    )

    if (relevantErrors.length > 0) {
      const errorDetails = {
        rejectedCount: relevantErrors.length,
        errors: relevantErrors,
        searchName: name,
      }

      handleApiError(
        new Error(`Failed to upsert ${relevantErrors.length} foods`),
        {
          component: 'ApiFood',
          operation: 'importFoodsFromApiByName',
          additionalData: errorDetails,
        },
      )

      showError(
        `Erro ao importar alguns alimentos: ${relevantErrors.length} falhas. Verifique o console para mais detalhes.`,
        { context: 'background' },
      )
    }
  } else {
    console.debug('[ApiFood] No failed upsertions, marking search as cached')
    await markSearchAsCached(name)
  }

  const upsertedFoods: ReadonlyArray<Food | null> = upsertionResults
    .filter(
      (result): result is PromiseFulfilledResult<Food | null> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value)

  console.debug(
    `[ApiFood] Returning ${upsertedFoods.length}/${apiFoods.length} foods`,
  )

  return upsertedFoods.filter((food): food is Food => food !== null)
}
