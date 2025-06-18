import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

const envSchema = z.object({
  VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  VITE_EXTERNAL_API_FOOD_PARAMS: z.string().min(1),
  VITE_EXTERNAL_API_REFERER: z.string().min(1),
  VITE_EXTERNAL_API_HOST: z.string().min(1),
  VITE_EXTERNAL_API_AUTHORIZATION: z.string().min(1),
  VITE_EXTERNAL_API_FOOD_ENDPOINT: z.string().min(1),
  VITE_EXTERNAL_API_EAN_ENDPOINT: z.string().min(1),
  VITE_EXTERNAL_API_BASE_URL: z.string().min(1),
  ENABLE_UNIFIED_ITEM_STRUCTURE: z
    .preprocess((v) => {
      if (typeof v === 'boolean') return v
      if (typeof v === 'string') return v === 'true'
      return false
    }, z.boolean())
    .default(false),
})

const getEnvVars = (): z.input<typeof envSchema> => {
  const importMetaEnv = import.meta.env as Record<string, string | undefined>
  return Object.fromEntries(
    Object.keys(envSchema.shape).map((key) => {
      const importMetaValue = importMetaEnv[key]
      const processEnvValue = process.env[key]
      const value =
        typeof importMetaValue === 'string'
          ? importMetaValue
          : typeof processEnvValue === 'string'
            ? processEnvValue
            : undefined
      return [key, value]
    }),
  ) as z.input<typeof envSchema>
}

const env = parseWithStack(envSchema, getEnvVars())

export default env
