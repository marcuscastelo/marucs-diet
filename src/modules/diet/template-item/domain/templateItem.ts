import { z } from 'zod'
import { itemSchema } from '~/modules/diet/food-item/domain/foodItem'
import { recipeItemSchema } from '~/modules/diet/recipe-item/domain/recipeItem'

export const templateItemSchema = z.discriminatedUnion('__type', [
  itemSchema,
  recipeItemSchema,
])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>
