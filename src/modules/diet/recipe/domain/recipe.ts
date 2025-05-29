import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { itemSchema } from '~/modules/diet/item/domain/item'

import { z } from 'zod'
import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { calcGroupMacros } from '~/legacy/utils/macroMath'
import { generateId } from '~/legacy/utils/idUtils'

export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(itemSchema).readonly(), // TODO: Think of a way to avoid id reuse on each item and bugs
  macros: macroNutrientsSchema,
  prepared_multiplier: z.number().default(1), // TODO: Rename all snake_case to camelCase (also in db)
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Recipe' as const),
})

export type Recipe = Readonly<z.infer<typeof recipeSchema>>

/**
 * Creates a new Recipe with calculated macros.
 * Used for initializing new recipes before saving to database.
 *
 * @param name - Name of the recipe
 * @param items - Array of items in the recipe
 * @param preparedMultiplier - Multiplier for prepared quantity (default: 1)
 * @param owner - User ID who owns this recipe
 * @returns A new Recipe with calculated macros
 */
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    macros: calcGroupMacros({ items } as ItemGroup), // TODO: Create a proper calcItemsMacros function for lists of items
    prepared_multiplier: preparedMultiplier,
    __type: 'Recipe',
  }
}

/**
 * Creates a Recipe from an ItemGroup.
 * Useful for converting item groups into standalone recipes.
 *
 * @param group - ItemGroup to convert to a recipe
 * @param owner - User ID who will own this recipe
 * @returns A new Recipe created from the group
 */
export function createRecipeFromGroup(group: ItemGroup, owner: number): Recipe {
  return createRecipe({
    name: group.name,
    items: [...group.items],
    owner,
  })
}
