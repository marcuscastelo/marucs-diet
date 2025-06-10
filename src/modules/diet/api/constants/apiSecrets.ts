import { z } from 'zod'
import { parseWithStack } from '~/shared/utils/parseWithStack'

import env from '~/shared/config/env'

export const EXTERNAL_API_BASE_URL = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_BASE_URL',
  }),
  env.VITE_EXTERNAL_API_BASE_URL,
)

export const EXTERNAL_API_EAN_ENDPOINT = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_EAN_ENDPOINT',
  }),
  env.VITE_EXTERNAL_API_EAN_ENDPOINT,
)

export const EXTERNAL_API_FOOD_ENDPOINT = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_FOOD_ENDPOINT',
  }),
  env.VITE_EXTERNAL_API_FOOD_ENDPOINT,
)

export const EXTERNAL_API_AUTHORIZATION = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_AUTHORIZATION',
  }),
  env.VITE_EXTERNAL_API_AUTHORIZATION,
)

export const EXTERNAL_API_HOST = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_HOST',
  }),
  env.VITE_EXTERNAL_API_HOST,
)

export const EXTERNAL_API_REFERER = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_REFERER',
  }),
  env.VITE_EXTERNAL_API_REFERER,
)

export const EXTERNAL_API_FOOD_PARAMS = parseWithStack(
  z.string({
    description: 'VITE_EXTERNAL_API_FOOD_PARAMS',
  }),
  env.VITE_EXTERNAL_API_FOOD_PARAMS,
)
