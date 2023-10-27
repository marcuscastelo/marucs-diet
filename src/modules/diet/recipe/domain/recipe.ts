import { ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { foodItemSchema } from '@/src/modules/diet/food-item/domain/foodItem'

import { z } from 'zod'
import { macroNutrientsSchema } from '@/src/modules/diet/macro-nutrients/domain/macroNutrients'
import { calcGroupMacros } from '@/legacy/utils/macroMath'
import { generateId } from '@/legacy/utils/idUtils'

export const recipeSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    owner: z.number(),
    items: z.array(foodItemSchema), // TODO: Think of a way to avoid id reuse on each item and bugs
    macros: macroNutrientsSchema.nullable().optional().default(null),
    prepared_multiplier: z.number().default(1), // TODO: Rename all snake_case to camelCase (also in db)
    __type: z
      .string()
      .nullable()
      .optional()
      .transform(() => 'Recipe' as const),
  })
  .transform((recipe) => {
    if (recipe.macros === null) {
      recipe.macros = calcGroupMacros({ items: recipe.items } as ItemGroup)
    }
    return recipe
  })

export type Recipe = Readonly<z.infer<typeof recipeSchema>>

// TODO: Create factory function for other models
export function createRecipe({
  name,
  items,
  preparedMultiplier = 1,
  owner,
}: {
  name: string
  items: Recipe['items']
  preparedMultiplier?: number
  owner: Recipe['owner']
}): Recipe {
  return {
    id: generateId(),
    owner,
    name,
    items,
    macros: calcGroupMacros({ items } as ItemGroup), // TODO: Create a proper calcItemsMacros function for lists of items
    prepared_multiplier: preparedMultiplier,
    __type: 'Recipe',
  }
}

export function createRecipeFromGroup(group: ItemGroup) {
  return createRecipe({
    name: group.name,
    items: [...group.items],
    owner: 3, // TODO: Get owner from somewhere (or create new Recipe type for data-only)
  })
}
