import { z } from 'zod'

export const EXTERNAL_API_BASE_URL = z
  .string({
    description: 'VITE_EXTERNAL_API_BASE_URL',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_BASE_URL)

export const EXTERNAL_API_EAN_ENDPOINT = z
  .string({
    description: 'VITE_EXTERNAL_API_EAN_ENDPOINT',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_EAN_ENDPOINT)

export const EXTERNAL_API_FOOD_ENDPOINT = z
  .string({
    description: 'VITE_EXTERNAL_API_FOOD_ENDPOINT',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_FOOD_ENDPOINT)

export const EXTERNAL_API_AUTHORIZATION = z
  .string({
    description: 'VITE_EXTERNAL_API_AUTHORIZATION',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_AUTHORIZATION)

export const EXTERNAL_API_HOST = z
  .string({
    description: 'VITE_EXTERNAL_API_HOST',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_HOST)

export const EXTERNAL_API_REFERER = z
  .string({
    description: 'VITE_EXTERNAL_API_REFERER',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_REFERER)

export const EXTERNAL_API_FOOD_PARAMS = z
  .string({
    description: 'VITE_EXTERNAL_API_FOOD_PARAMS',
  })
  .parse(import.meta.env.VITE_EXTERNAL_API_FOOD_PARAMS)
