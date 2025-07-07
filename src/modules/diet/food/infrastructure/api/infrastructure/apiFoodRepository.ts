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
import {
  handleInfrastructureError,
  wrapErrorWithStack,
} from '~/shared/error/errorHandler'
import { jsonParseWithStack } from '~/shared/utils/jsonParseWithStack'
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

  let parsedParams: unknown
  try {
    parsedParams = jsonParseWithStack(EXTERNAL_API_FOOD_PARAMS)
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    parsedParams = {}
  }
  const params =
    typeof parsedParams === 'object' && parsedParams !== null
      ? parsedParams
      : {}

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
      ...params,
      search: name,
    },
  }

  console.debug(`[ApiFood] Fetching foods with name from url ${url}`, config)
  let response
  try {
    response = await API.get(url, config)
  } catch (error) {
    handleInfrastructureError(error, {
      operation: 'infraOperation',
      entityType: 'Infrastructure',
      module: 'infrastructure',
      component: 'repository',
    })
    throw wrapErrorWithStack(error)
  }

  console.debug(`[ApiFood] Response from url ${url}`, response.data)

  const data = response.data as Record<string, unknown>
  const alimentosRaw = data.alimentos
  if (!Array.isArray(alimentosRaw)) {
    handleInfrastructureError(
      new Error('Invalid alimentos array in API response'),
      {
        operation: 'fetchApiFoodsByName',
        entityType: 'ApiFood',
        module: 'diet/food',
        component: 'apiFoodRepository',
        additionalData: { url, dataType: typeof alimentosRaw },
      },
    )
    return []
  }
  return parseWithStack(apiFoodSchema.array(), alimentosRaw)
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
