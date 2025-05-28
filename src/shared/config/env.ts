import { z } from "zod";

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

const envSchema = z.object(
  Object.fromEntries(
    requiredEnv.map((key) => [key, z.string().min(1, `${key} cannot be empty`)])
  ) as Record<EnvKeys, z.ZodString>
)

const getEnvVars = (): Record<EnvKeys, string> => {
  return Object.fromEntries(
    requiredEnv.map((key) => {
      const value = import.meta.env[key] || process.env[key];
      if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
      }
      return [key, value];
    })
  ) as Record<EnvKeys, string>;
}

const env = envSchema.parse(getEnvVars())

export default env