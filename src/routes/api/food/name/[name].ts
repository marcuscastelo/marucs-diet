import { type APIEvent } from '@solidjs/start/server'
import { json } from '@solidjs/router'
import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'
import { type AxiosError } from 'axios'

const apiFoodRepository = createApiFoodRepository()

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  try {
    const apiFood = await apiFoodRepository.fetchApiFoodsByName(
      decodeURIComponent(params.name),
    )
    console.debug('apiFood', apiFood)
    return json(apiFood)
  } catch (error) {
    console.error('Error fetching foods by name:', error)
    return json(
      {
        error: 'Error fetching foods by name: ' + (error as AxiosError).message,
      },
      { status: (error as AxiosError).status },
    )
  }
}
