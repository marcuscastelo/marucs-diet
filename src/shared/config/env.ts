const requiredEnv = [
  'VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_NEXT_PUBLIC_SUPABASE_URL',
  'VITE_EXTERNAL_API_FOOD_PARAMS',
  'VITE_EXTERNAL_API_REFERER',
  'VITE_EXTERNAL_API_HOST',
  'VITE_EXTERNAL_API_AUTHORIZATION',
  'VITE_EXTERNAL_API_FOOD_ENDPOINT',
  'VITE_EXTERNAL_API_EAN_ENDPOINT',
  'VITE_EXTERNAL_API_BASE_URL',
] as const

type EnvKeys = typeof requiredEnv[number]

const env: Record<EnvKeys, string> = {} as any

for (const key of requiredEnv) {
  const value = import.meta.env[key] || process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  env[key] = value
}

export default env