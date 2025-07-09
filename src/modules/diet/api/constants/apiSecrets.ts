import { z } from 'zod/v4'

import env from '~/shared/config/env'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const EXTERNAL_API_BASE_URL = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_BASE_URL,
)

export const EXTERNAL_API_EAN_ENDPOINT = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_EAN_ENDPOINT,
)

export const EXTERNAL_API_FOOD_ENDPOINT = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_FOOD_ENDPOINT,
)

export const EXTERNAL_API_AUTHORIZATION = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_AUTHORIZATION,
)

export const EXTERNAL_API_HOST = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_HOST,
)

export const EXTERNAL_API_REFERER = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_REFERER,
)

export const EXTERNAL_API_FOOD_PARAMS = parseWithStack(
  z.string(),
  env.VITE_EXTERNAL_API_FOOD_PARAMS,
)
