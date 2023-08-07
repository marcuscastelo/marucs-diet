import { FoodItemGroup } from './foodItemGroupModel'
import { itemSchema } from './foodItemModel'

import { z } from 'zod'

export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(itemSchema), // TODO: Think of a way to avoid id reuse on each item and bugs
  prepared_multiplier: z.number().default(1), // TODO: Rename all snake_case to camelCase (also in db)
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
  preparedMultiplier = 1,
}: {
  name: string
  items: Recipe['items']
  preparedMultiplier?: number
}): Recipe {
  return {
    id: Math.floor(Math.random() * 1000000),
    owner: 3, // TODO: Get user id
    name,
    items,
    prepared_multiplier: preparedMultiplier,
    '': 'Recipe',
  }
}

export function createRecipeFromGroup(group: FoodItemGroup) {
  return createRecipe({
    name: group.name,
    items: [...group.items],
  })
}
