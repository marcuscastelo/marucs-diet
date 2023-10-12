import { macroNutrientsSchema } from './macroNutrientsModel'
import { z } from 'zod'
export const foodSchema = z.object({
  id: z.number(),
  source: z
    .object({
      type: z.literal('api'),
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
  macros: macroNutrientsSchema,
  recipeId: z
    .number()
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Food' as const),
})

export type Food = Readonly<z.infer<typeof foodSchema>>
