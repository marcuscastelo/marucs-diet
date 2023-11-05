import {
  EXTERNAL_API_AUTHORIZATION,
  EXTERNAL_API_BASE_URL,
  EXTERNAL_API_EAN_ENDPOINT,
  EXTERNAL_API_FOOD_ENDPOINT,
  EXTERNAL_API_FOOD_PARAMS,
  EXTERNAL_API_HOST,
  EXTERNAL_API_REFERER,
} from '@/modules/diet/api/constants/apiSecrets'
import {
  apiFoodSchema,
  type ApiFood,
} from '@/modules/diet/food/infrastructure/api/domain/apiFoodModel'
import { type ApiFoodRepository } from '@/modules/diet/food/infrastructure/api/domain/apiFoodRepository'

import axios from 'axios'

export function createApiFoodRepository(): ApiFoodRepository {
  return {
    fetchApiFoodByEan,
    fetchApiFoods,
    fetchApiFoodsByName,
  }
}

async function fetchApiFoods(): Promise<readonly ApiFood[]> {
  return await fetchApiFoodsByName('')
}

async function fetchApiFoodsByName(
  name: Required<ApiFood>['nome'],
): Promise<readonly ApiFood[]> {
  const url = `${EXTERNAL_API_BASE_URL}/${EXTERNAL_API_FOOD_ENDPOINT}`
  const response = await axios.get(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-encoding': 'gzip',
      'app-token': 'wapstore',
      authorization: EXTERNAL_API_AUTHORIZATION,
      connection: 'Keep-Alive',
      host: EXTERNAL_API_HOST,
      referer: EXTERNAL_API_REFERER,
      'user-agent': 'okhttp/4.9.2',
    },
    params: {
      ...(JSON.parse(EXTERNAL_API_FOOD_PARAMS) as object),
      search: name,
    },
  })

  return apiFoodSchema.array().parse(response.data.alimentos)
}

async function fetchApiFoodByEan(
  ean: Required<ApiFood>['ean'],
): Promise<ApiFood> {
  const url = `${EXTERNAL_API_BASE_URL}/${EXTERNAL_API_EAN_ENDPOINT}/${ean}`
  const response = await axios.get(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-encoding': 'gzip',
      'app-token': 'wapstore',
      authorization: EXTERNAL_API_AUTHORIZATION,
      connection: 'Keep-Alive',
      host: EXTERNAL_API_HOST,
      referer: EXTERNAL_API_REFERER,
      'user-agent': 'okhttp/4.9.2',
    },
  })
  console.log(response.data)
  console.dir(response.data)
  return apiFoodSchema.parse(response.data)
}
