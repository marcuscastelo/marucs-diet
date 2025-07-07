import { json } from '@solidjs/router'
import { type APIEvent } from '@solidjs/start/server'
import { type AxiosError } from 'axios'

import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'
import {
  handleApplicationError,
  handleInfrastructureError,
  handleValidationError,
} from '~/shared/error/errorHandler'

const apiFoodRepository = createApiFoodRepository()

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  if (params.ean === undefined || params.ean === '') {
    return json({ error: 'EAN parameter is required' }, { status: 400 })
  }
  try {
    const apiFood = await apiFoodRepository.fetchApiFoodByEan(params.ean)
    console.debug('apiFood', apiFood)

    return json(apiFood)
  } catch (error) {
    handleInfrastructureError(error, {
      operation: 'infraOperation',
      entityType: 'Infrastructure',
      module: 'infrastructure',
      component: 'repository',
    })
    return json(
      {
        error:
          'Error fetching food item by EAN: ' + (error as AxiosError).message,
      },
      { status: (error as AxiosError).status },
    )
  }
}
