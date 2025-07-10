import { json } from '@solidjs/router'
import { type APIEvent } from '@solidjs/start/server'
import { type AxiosError } from 'axios'

import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'
import { createErrorHandler } from '~/shared/error/errorHandler'

const apiFoodRepository = createApiFoodRepository()

const errorHandler = createErrorHandler('infrastructure', 'Food')

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  if (params.name === undefined || params.name === '') {
    return json({ error: 'Name parameter is required' }, { status: 400 })
  }
  try {
    const apiFood = await apiFoodRepository.fetchApiFoodsByName(
      decodeURIComponent(params.name),
    )
    console.debug('apiFood', apiFood)
    return json(apiFood)
  } catch (error) {
    errorHandler.error(error)
    return json(
      {
        error:
          'Error fetching food items by name: ' + (error as AxiosError).message,
      },
      { status: (error as AxiosError).status },
    )
  }
}
