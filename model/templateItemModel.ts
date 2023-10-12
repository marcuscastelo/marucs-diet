import { z } from 'zod'
import { foodItemSchema } from './foodItemModel'
import { recipeItemSchema } from './recipeItemModel'

export const templateItemSchema = z.discriminatedUnion('__type', [
  foodItemSchema,
  recipeItemSchema,
])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>
