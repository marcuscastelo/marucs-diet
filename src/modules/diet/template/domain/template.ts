import { z } from 'zod'
import { foodSchema } from '@/modules/diet/food/domain/food'
import { recipeSchema } from '@/src/modules/diet/recipe/domain/recipe'

export const TemplateSchema = z.discriminatedUnion('__type', [
  z
    .object({
      __type: z.literal('food'),
    })
    .merge(foodSchema),
  z
    .object({
      __type: z.literal('recipe'),
    })
    .merge(recipeSchema),
])

export type Template = Readonly<z.infer<typeof TemplateSchema>>
