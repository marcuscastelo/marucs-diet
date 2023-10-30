import axios from 'axios'
import {
  EXTERNAL_API_AUTHORIZATION,
  EXTERNAL_API_BASE_URL,
  EXTERNAL_API_FOOD_ENDPOINT,
  EXTERNAL_API_FOOD_PARAMS,
  EXTERNAL_API_HOST,
  EXTERNAL_API_REFERER,
} from '@/legacy/api/apiSecrets'

export const searchFoodNameInternal = async (food: string) => {
  return JSON.stringify('oi')

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
      search: food,
    },
  })

  return response.data
}
