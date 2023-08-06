import { FoodItemGroup } from './foodItemGroupModel'
import { itemSchema } from './foodItemModel'

import { z } from 'zod'

export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(itemSchema), // TODO: Think of a way to avoid id reuse on each item and bugs
  '': z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Recipe' as const),
})

export type Recipe = z.infer<typeof recipeSchema>

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
    owner: 3, // TODO: Get user id
    name,
    items,
    '': 'Recipe',
  }
}

export function createRecipeFromGroup(group: FoodItemGroup) {
  return createRecipe({
    name: group.name,
    items: [...group.items],
  })
}
