import { z } from 'zod'
import { foodItemSchema } from '@/legacy/model/foodItemModel'
import { recipeItemSchema } from '@/legacy/model/recipeItemModel'

export const templateItemSchema = z.discriminatedUnion('__type', [
  foodItemSchema,
  recipeItemSchema,
])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>
