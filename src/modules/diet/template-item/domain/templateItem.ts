import { z } from 'zod'
import { foodItemSchema } from '@/src/modules/diet/food-item/domain/foodItem'
import { recipeItemSchema } from '@/modules/diet/recipe-item/domain/recipeItem'

export const templateItemSchema = z.discriminatedUnion('__type', [
  foodItemSchema,
  recipeItemSchema,
])

export type TemplateItem = Readonly<z.infer<typeof templateItemSchema>>
