import axios from 'axios'
import rateLimit from 'axios-rate-limit'

import {
  EXTERNAL_API_AUTHORIZATION,
  EXTERNAL_API_BASE_URL,
  EXTERNAL_API_EAN_ENDPOINT,
  EXTERNAL_API_FOOD_ENDPOINT,
  EXTERNAL_API_FOOD_PARAMS,
  EXTERNAL_API_HOST,
  EXTERNAL_API_REFERER,
} from '~/modules/diet/api/constants/apiSecrets'
import {
  type ApiFood,
  apiFoodSchema,
} from '~/modules/diet/food/infrastructure/api/domain/apiFoodModel'
import { type ApiFoodRepository } from '~/modules/diet/food/infrastructure/api/domain/apiFoodRepository'
import { handleApiError } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const API = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 1000,
  maxRPS: 2,
})

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

  const config = {
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
  }

  console.debug(`[ApiFood] Fetching foods with name from url ${url}`, config)
  let response
  try {
    response = await API.get(url, config)
  } catch (error) {
    handleApiError(error, {
      component: 'ApiFoodRepository',
      operation: 'fetchApiFoodsByName',
      additionalData: { url, name },
    })
    throw error
  }

  console.debug(`[ApiFood] Response from url ${url}`, response.data)

  const data = response.data as Record<string, unknown>
  const alimentos = data.alimentos
  if (!Array.isArray(alimentos)) {
    handleApiError(new Error('Invalid alimentos array in API response'), {
      component: 'ApiFoodRepository',
      operation: 'fetchApiFoodsByName',
      additionalData: { url, name, data },
    })
    return []
  }
  return parseWithStack(apiFoodSchema.array(), alimentos)
}

async function fetchApiFoodByEan(
  ean: Required<ApiFood>['ean'],
): Promise<ApiFood> {
  const url = `${EXTERNAL_API_BASE_URL}/${EXTERNAL_API_EAN_ENDPOINT}/${ean}`
  const response = await API.get(url, {
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
  return parseWithStack(apiFoodSchema, response.data)
}
