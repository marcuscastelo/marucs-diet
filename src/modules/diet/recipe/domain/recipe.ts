import { z } from 'zod/v4'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createIdField,
  createNameField,
  createNewTypeField,
  createOwnerField,
  createPreparedMultiplierField,
  createTypeField,
} from '~/shared/domain/commonFields'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// Legacy schemas for database compatibility (using Item[])
export const recipeSchema = z.object({
  id: createIdField('recipe'),
  name: createNameField('recipe'),
  owner: createOwnerField('recipe'),
  items: itemSchema.array().readonly(),
  prepared_multiplier: createPreparedMultiplierField('recipe'),
  __type: createTypeField('Recipe'),
})

export const newRecipeSchema = recipeSchema
  .omit({ id: true, __type: true })
  .extend({ __type: createNewTypeField('NewRecipe') })
  .refine((val) => Array.isArray(val.items), {
    message: 'items must be an array',
    path: ['items'],
  })

export const unifiedRecipeSchema = z.object({
  id: createIdField('recipe'),
  name: createNameField('recipe'),
  owner: createOwnerField('recipe'),
  items: unifiedItemSchema.array().readonly(),
  prepared_multiplier: createPreparedMultiplierField('recipe'),
  __type: createTypeField('UnifiedRecipe'),
})

export const newUnifiedRecipeSchema = unifiedRecipeSchema
  .omit({ id: true, __type: true })
  .extend({ __type: createNewTypeField('NewUnifiedRecipe') })
  .refine((val) => Array.isArray(val.items), {
    message: 'items must be an array',
    path: ['items'],
  })

// Legacy types (using Item[])
export type NewRecipe = Readonly<z.infer<typeof newRecipeSchema>>
export type Recipe = Readonly<z.infer<typeof recipeSchema>>

// New types (using UnifiedItem[])
export type NewUnifiedRecipe = Readonly<z.infer<typeof newUnifiedRecipeSchema>>
export type UnifiedRecipe = Readonly<z.infer<typeof unifiedRecipeSchema>>

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
  return parseWithStack(newRecipeSchema, {
    name: recipe.name,
    owner: recipe.owner,
    items: recipe.items,
    prepared_multiplier: recipe.prepared_multiplier,
    __type: 'NewRecipe',
  })
}

/**
 * Creates a new NewUnifiedRecipe using UnifiedItem[].
 * Used for initializing new recipes before saving to database.
 *
 * @param name - Name of the recipe
 * @param items - Array of UnifiedItems in the recipe
 * @param preparedMultiplier - Multiplier for prepared quantity (default: 1)
 * @param owner - User ID who owns this recipe
 * @returns A new NewUnifiedRecipe
 */
export function createNewUnifiedRecipe({
  name,
  items,
  preparedMultiplier = 1,
  owner,
}: {
  name: string
  items: NewUnifiedRecipe['items']
  preparedMultiplier?: number
  owner: NewUnifiedRecipe['owner']
}): NewUnifiedRecipe {
  return {
    name,
    items,
    prepared_multiplier: preparedMultiplier,
    owner,
    __type: 'NewUnifiedRecipe',
  }
}

/**
 * Promotes a NewUnifiedRecipe to a UnifiedRecipe after persistence.
 *
 * @param newRecipe - The NewUnifiedRecipe to promote
 * @param id - The ID assigned to the recipe upon persistence
 * @returns The promoted UnifiedRecipe
 */
export function promoteToUnifiedRecipe(
  newRecipe: NewUnifiedRecipe,
  id: number,
): UnifiedRecipe {
  return {
    ...newRecipe,
    id,
    __type: 'UnifiedRecipe',
  }
}

/**
 * Demotes a UnifiedRecipe to a NewUnifiedRecipe for updates.
 * Used when converting a persisted UnifiedRecipe back to NewUnifiedRecipe for database operations.
 */
export function demoteToNewUnifiedRecipe(
  recipe: UnifiedRecipe,
): NewUnifiedRecipe {
  return parseWithStack(newUnifiedRecipeSchema, {
    name: recipe.name,
    owner: recipe.owner,
    items: recipe.items,
    prepared_multiplier: recipe.prepared_multiplier,
    __type: 'NewUnifiedRecipe',
  })
}
