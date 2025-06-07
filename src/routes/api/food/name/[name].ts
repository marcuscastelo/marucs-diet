import { type APIEvent } from '@solidjs/start/server'
import { type AxiosError } from 'axios'
import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'
import { handleApiError } from '~/shared/error/errorHandler'

const apiFoodRepository = createApiFoodRepository()

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  if (params.name === undefined || params.name === '') {
    return new Response(
      JSON.stringify({ error: 'Name parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
  try {
    const apiFood = await apiFoodRepository.fetchApiFoodsByName(
      decodeURIComponent(params.name),
    )
    console.debug('apiFood', apiFood)
    return new Response(JSON.stringify(apiFood), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    handleApiError(error, {
      component: 'ApiRoute',
      operation: 'fetchApiFoodsByName',
      additionalData: { name: params.name },
    })
    return new Response(
      JSON.stringify({
        error:
          'Error fetching food items by name: ' + (error as AxiosError).message,
      }),
      {
        status: (error as AxiosError).status ?? 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
