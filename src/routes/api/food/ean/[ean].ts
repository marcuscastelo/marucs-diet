import { type APIEvent } from '@solidjs/start/server'
import { json } from '@solidjs/router'
import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'

const apiFoodRepository = createApiFoodRepository()

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  const apiFood = await apiFoodRepository.fetchApiFoodByEan(params.ean)
  console.debug('apiFood', apiFood)

  return json(apiFood)
}
