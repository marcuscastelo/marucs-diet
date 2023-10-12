import { z } from 'zod'
import { foodSchema } from './foodModel'
import { recipeSchema } from './recipeModel'

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
