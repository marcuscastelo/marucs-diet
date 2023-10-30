import { z } from 'zod'

export const EXTERNAL_API_BASE_URL = z
  .string()
  .parse(process.env.EXTERNAL_API_BASE_URL)

export const EXTERNAL_API_EAN_ENDPOINT = z
  .string()
  .parse(process.env.EXTERNAL_API_EAN_ENDPOINT)

export const EXTERNAL_API_FOOD_ENDPOINT = z
  .string()
  .parse(process.env.EXTERNAL_API_FOOD_ENDPOINT)

export const EXTERNAL_API_AUTHORIZATION = z
  .string()
  .parse(process.env.EXTERNAL_API_AUTHORIZATION)

export const EXTERNAL_API_HOST = z.string().parse(process.env.EXTERNAL_API_HOST)

export const EXTERNAL_API_REFERER = z
  .string()
  .parse(process.env.EXTERNAL_API_REFERER)

export const EXTERNAL_API_FOOD_PARAMS = z
  .string()
  .parse(process.env.EXTERNAL_API_FOOD_PARAMS)
