import { foodItemSchema } from './foodItemModel'

import { z } from 'zod'

export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(foodItemSchema),
})

export type Recipe = z.infer<typeof recipeSchema> & {
  readonly '': 'Recipe'
}

// TODO: Create factory function for other models
export function createRecipe({
  name,
  items,
}: {
  name: string
  items: Recipe['items']
}): Recipe {
  return {
    id: Math.floor(Math.random() * 1000000),
    name,
    items,
    '': 'Recipe',
  }
}
