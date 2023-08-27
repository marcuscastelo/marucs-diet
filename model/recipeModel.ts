import { ItemGroup } from './itemGroupModel'
import { foodItemSchema } from './foodItemModel'

import { z } from 'zod'
import { MacroNutrients, macroNutrientsSchema } from './macroNutrientsModel'
import { calcGroupMacros } from '@/utils/macroMath'
import { generateId } from '@/utils/idUtils'

export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(foodItemSchema), // TODO: Think of a way to avoid id reuse on each item and bugs
  macros: macroNutrientsSchema
    .nullable()
    .optional()
    .transform(
      (macros) =>
        macros ?? ({ carbs: 0, fat: 0, protein: 0 } satisfies MacroNutrients), // TODO: Remove transform or derive from items
    ),
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
    id: generateId(),
    owner: 3, // TODO: Get user id
    name,
    items,
    macros: calcGroupMacros({ items } as ItemGroup), // TODO: Create a proper calcItemsMacros function for lists of items
    prepared_multiplier: preparedMultiplier,
    '': 'Recipe',
  }
}

export function createRecipeFromGroup(group: ItemGroup) {
  return createRecipe({
    name: group.name,
    items: [...group.items],
  })
}
