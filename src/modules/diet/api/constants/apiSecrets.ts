import { z } from 'zod'
import env from '~/shared/config/env'

export const EXTERNAL_API_BASE_URL = z
  .string({
    description: 'VITE_EXTERNAL_API_BASE_URL',
  })
  .parse(env.VITE_EXTERNAL_API_BASE_URL)

export const EXTERNAL_API_EAN_ENDPOINT = z
  .string({
    description: 'VITE_EXTERNAL_API_EAN_ENDPOINT',
  })
  .parse(env.VITE_EXTERNAL_API_EAN_ENDPOINT)

export const EXTERNAL_API_FOOD_ENDPOINT = z
  .string({
    description: 'VITE_EXTERNAL_API_FOOD_ENDPOINT',
  })
  .parse(env.VITE_EXTERNAL_API_FOOD_ENDPOINT)

export const EXTERNAL_API_AUTHORIZATION = z
  .string({
    description: 'VITE_EXTERNAL_API_AUTHORIZATION',
  })
  .parse(env.VITE_EXTERNAL_API_AUTHORIZATION)

export const EXTERNAL_API_HOST = z
  .string({
    description: 'VITE_EXTERNAL_API_HOST',
  })
  .parse(env.VITE_EXTERNAL_API_HOST)

export const EXTERNAL_API_REFERER = z
  .string({
    description: 'VITE_EXTERNAL_API_REFERER',
  })
  .parse(env.VITE_EXTERNAL_API_REFERER)

export const EXTERNAL_API_FOOD_PARAMS = z
  .string({
    description: 'VITE_EXTERNAL_API_FOOD_PARAMS',
  })
  .parse(env.VITE_EXTERNAL_API_FOOD_PARAMS)
