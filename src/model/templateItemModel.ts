import { z } from 'zod'
import { foodItemSchema } from '@/model/foodItemModel'
import { recipeItemSchema } from '@/model/recipeItemModel'

export const templateItemSchema = z.discriminatedUnion('__type', [
  foodItemSchema,
  recipeItemSchema,
])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>
