import { macroNutrientsSchema } from '@/legacy/model/macroNutrientsModel'
import { z } from 'zod'
import { DbReady, New, enforceDbReady, enforceNew } from '../utils/newDbRecord'
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

// TODO: Make createFood function more than a mock
export function createFood({ name }: { name: string }): New<Food> {
  return enforceNew(
    foodSchema.parse({
      __type: 'Food',
      id: 0,
      name,
      macros: {
        protein: 1234,
        carbs: 4321,
        fat: 666,
      },
    } satisfies Food),
  )
}
