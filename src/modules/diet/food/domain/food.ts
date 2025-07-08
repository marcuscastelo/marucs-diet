import { z } from 'zod/v4'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createZodEntity } from '~/shared/domain/validationMessages'

const ze = createZodEntity('food')

export const {
  schema: foodSchema,
  newSchema: newFoodSchema,
  createNew: createNewFood,
  promote: promoteNewFoodToFood,
  demote: demoteFoodToNewFood,
} = ze.create({
  id: ze.number(),
  source: z
    .object({
      type: z.literal('api'),
      id: ze.string(),
    })
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  name: ze.string(),
  ean: ze.string().nullable(),
  macros: macroNutrientsSchema,
})

export type NewFood = Readonly<z.infer<typeof newFoodSchema>>
export type Food = Readonly<z.infer<typeof foodSchema>>
