import { type APIEvent, json } from 'solid-start/api'
import { createApiFoodRepository } from '~/modules/diet/food/infrastructure/api/infrastructure/apiFoodRepository'

const apiFoodRepository = createApiFoodRepository()

export async function GET({ params }: APIEvent) {
  console.debug('GET', params)
  const apiFood = await apiFoodRepository.fetchApiFoodsByName(
    decodeURIComponent(params.name),
  )
  console.debug('apiFood', apiFood)
  return json(apiFood)
}
