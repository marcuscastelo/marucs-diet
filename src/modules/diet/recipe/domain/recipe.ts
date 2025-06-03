import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { itemSchema } from '~/modules/diet/item/domain/item'

import { z } from 'zod'

export const newRecipeSchema = z.object({
  name: z.string(),
  owner: z.number(),
  items: z.array(itemSchema).readonly(),
  prepared_multiplier: z.number().default(1),
  __type: z.literal('NewRecipe'),
})

export const recipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.number(),
  items: z.array(itemSchema).readonly(), // TODO:   Think of a way to avoid id reuse on each item and bugs
  prepared_multiplier: z.number().default(1), // TODO:   Rename all snake_case to camelCase (also in db)
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Recipe' as const),
})

export type NewRecipe = Readonly<z.infer<typeof newRecipeSchema>>
export type Recipe = Readonly<z.infer<typeof recipeSchema>>

/**
 * Creates a Recipe from an ItemGroup.
 * Useful for converting item groups into standalone recipes.
 *
 * @param group - ItemGroup to convert to a recipe
 * @param owner - User ID who will own this recipe
 * @returns A new Recipe created from the group
 */
export function createNewRecipeFromGroup(
  group: ItemGroup,
  owner: number,
): NewRecipe {
  return createNewRecipe({
    name: group.name,
    items: [...group.items],
    owner,
  })
}

/**
 * Creates a new NewRecipe.
 * Used for initializing new recipes before saving to database.
 *
 * @param name - Name of the recipe
 * @param items - Array of items in the recipe
 * @param preparedMultiplier - Multiplier for prepared quantity (default: 1)
 * @param owner - User ID who owns this recipe
 * @returns A new NewRecipe
 */
export function createNewRecipe({
  name,
  items,
  preparedMultiplier = 1,
  owner,
}: {
  name: string
  items: NewRecipe['items']
  preparedMultiplier?: number
  owner: NewRecipe['owner']
}): NewRecipe {
  return {
    name,
    items,
    prepared_multiplier: preparedMultiplier,
    owner,
    __type: 'NewRecipe',
  }
}

/**
 * Promotes a NewRecipe to a Recipe after persistence.
 *
 * @param newRecipe - The NewRecipe to promote
 * @param id - The ID assigned to the recipe upon persistence
 * @returns The promoted Recipe
 */
export function promoteToRecipe(newRecipe: NewRecipe, id: number): Recipe {
  return {
    ...newRecipe,
    id,
    __type: 'Recipe',
  }
}

/**
 * Demotes a Recipe to a NewRecipe for updates.
 * Used when converting a persisted Recipe back to NewRecipe for database operations.
 */
export function demoteToNewRecipe(recipe: Recipe): NewRecipe {
  return newRecipeSchema.parse({
    name: recipe.name,
    owner: recipe.owner,
    items: recipe.items,
    prepared_multiplier: recipe.prepared_multiplier,
    __type: 'NewRecipe',
  })
}
