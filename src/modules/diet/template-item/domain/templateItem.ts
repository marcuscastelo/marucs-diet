import { z } from 'zod'
import { itemSchema } from '~/modules/diet/item/domain/item'
import { recipeItemSchema } from '~/modules/diet/recipe-item/domain/recipeItem'

export const templateItemSchema = z.discriminatedUnion('__type', [
  itemSchema,
  recipeItemSchema,
])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>
