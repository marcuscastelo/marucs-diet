import { type APIEvent } from '@solidjs/start/server'
import { type AxiosError } from 'axios'
import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'
import { handleApiError } from '~/shared/error/errorHandler'

const apiFoodRepository = createApiFoodRepository()

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  if (params.ean === undefined || params.ean === '') {
    return new Response(
      JSON.stringify({ error: 'EAN parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
  try {
    const apiFood = await apiFoodRepository.fetchApiFoodByEan(params.ean)
    console.debug('apiFood', apiFood)
    return new Response(JSON.stringify(apiFood), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    handleApiError(error, {
      component: 'ApiRoute',
      operation: 'fetchApiFoodByEan',
      additionalData: { ean: params.ean },
    })
    return new Response(
      JSON.stringify({
        error:
          'Error fetching food item by EAN: ' + (error as AxiosError).message,
      }),
      {
        status: (error as AxiosError).status ?? 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
