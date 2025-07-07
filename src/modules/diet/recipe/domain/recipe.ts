import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  type UnifiedItem, // eslint-disable-line @typescript-eslint/no-unused-vars
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createCreatedAtField,
  createDescriptionField,
  createIdField,
  createNameField,
  createNewTypeField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { createNumberField } from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// Legacy schemas for database compatibility (using Item[])
export const newRecipeSchema = z
  .object({
    userId: createUserIdField(),
    name: createNameField(),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    items: itemSchema.array(),
    prepared_multiplier: createNumberField('prepared_multiplier').default(1),
    __type: createNewTypeField('NewRecipe'),
  })
  .strip()

export const recipeSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createNameField(),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    items: itemSchema.array().readonly(),
    prepared_multiplier: createNumberField('prepared_multiplier').default(1),
    __type: createTypeField('Recipe'),
  })
  .strip()

// New schemas using UnifiedItem[] for in-memory operations
export const newUnifiedRecipeSchema = z
  .object({
    userId: createUserIdField(),
    name: createNameField(),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    items: unifiedItemSchema.array(),
    prepared_multiplier: createNumberField('prepared_multiplier').default(1),
    __type: createNewTypeField('NewUnifiedRecipe'),
  })
  .strip()

export const unifiedRecipeSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createNameField(),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    items: unifiedItemSchema.array().readonly(),
    prepared_multiplier: createNumberField('prepared_multiplier').default(1),
    __type: createTypeField('UnifiedRecipe'),
  })
  .strip()

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
 * @param userId - User ID who will own this recipe
 * @returns A new Recipe created from the group
 */
export function createNewRecipeFromGroup(
  group: ItemGroup,
  userId: number,
): NewRecipe {
  return createNewRecipe({
    name: group.name,
    items: [...group.items],
    userId,
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
  description = null,
  items,
  preparedMultiplier = 1,
  userId,
}: {
  name: string
  description?: string | null
  items: NewRecipe['items']
  preparedMultiplier?: number
  userId: number
}): NewRecipe {
  const now = new Date()
  return {
    name,
    description,
    items,
    prepared_multiplier: preparedMultiplier,
    userId,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewRecipe',
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
    description: recipe.description,
    userId: recipe.userId,
    items: recipe.items,
    prepared_multiplier: recipe.prepared_multiplier,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    __type: 'new-NewRecipe',
  })
}

/**
 * Creates a new NewUnifiedRecipe using UnifiedItem[].
 * Used for initializing new recipes before saving to database.
 *
 * @param name - Name of the recipe
 * @param description - Optional description
 * @param items - Array of UnifiedItems in the recipe
 * @param preparedMultiplier - Multiplier for prepared quantity (default: 1)
 * @param userId - User ID who owns this recipe
 * @returns A new NewUnifiedRecipe
 */
export function createNewUnifiedRecipe({
  name,
  description = null,
  items,
  preparedMultiplier = 1,
  userId,
}: {
  name: string
  description?: string | null
  items: NewUnifiedRecipe['items']
  preparedMultiplier?: number
  userId: number
}): NewUnifiedRecipe {
  const now = new Date()
  return {
    name,
    description,
    items,
    prepared_multiplier: preparedMultiplier,
    userId,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewUnifiedRecipe',
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
    description: recipe.description,
    userId: recipe.userId,
    items: recipe.items,
    prepared_multiplier: recipe.prepared_multiplier,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    __type: 'new-NewUnifiedRecipe',
  })
}
