import { MacroNutrientsSchema } from './macroNutrientsModel'
import { z } from 'zod'

export const foodSchema = z.object({
  id: z.number(),
  source: z
    .object({
      type: z.union([z.literal('api'), z.literal('tbca')]),
      id: z.string(),
    })
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  name: z.string(),
  ean: z
    .string()
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  macros: MacroNutrientsSchema,
})

export type Food = z.infer<typeof foodSchema>
