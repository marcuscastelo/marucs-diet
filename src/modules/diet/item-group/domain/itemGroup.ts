import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { handleApiError } from '~/shared/error/errorHandler'
import { transformItemGroup } from '~/shared/domainTransformers/itemGroupTransformers'

// TODO:   Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types)
// TODO:   In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106)

export const simpleItemGroupSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' do grupo é obrigatório.",
    invalid_type_error: "O campo 'id' do grupo deve ser um número.",
  }),
  name: z.string({
    required_error: "O campo 'name' do grupo é obrigatório.",
    invalid_type_error: "O campo 'name' do grupo deve ser uma string.",
  }),
  items: itemSchema.array(),
  recipe: z
    .number({
      required_error:
        "O campo 'recipe' do grupo é obrigatório quando presente.",
      invalid_type_error: "O campo 'recipe' do grupo deve ser um número.",
    })
    .nullable()
    .optional()
    .transform((recipe) => recipe ?? undefined),
  __type: z.literal('ItemGroup').optional().default('ItemGroup'),
})

export const recipedItemGroupSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' do grupo é obrigatório.",
    invalid_type_error: "O campo 'id' do grupo deve ser um número.",
  }),
  name: z.string({
    required_error: "O campo 'name' do grupo é obrigatório.",
    invalid_type_error: "O campo 'name' do grupo deve ser uma string.",
  }),
  items: itemSchema
    .array()
    .refine((arr) => Array.isArray(arr) && arr.length > 0, {
      message:
        "O campo 'items' do grupo deve ser uma lista de itens e não pode ser vazio.",
    })
    .readonly(),
  recipe: z.number({
    required_error: "O campo 'recipe' do grupo é obrigatório.",
    invalid_type_error: "O campo 'recipe' do grupo deve ser um número.",
  }),
  __type: z.literal('ItemGroup').default('ItemGroup'),
})

export const itemGroupSchema = z.union([
  simpleItemGroupSchema,
  recipedItemGroupSchema,
])

/**
 * Type guard for SimpleItemGroup.
 * @param group - The ItemGroup to check
 * @returns True if group is SimpleItemGroup
 */
export function isSimpleItemGroup(group: ItemGroup): group is SimpleItemGroup {
  return typeof group.recipe !== 'number' || isNaN(group.recipe)
}

/**
 * Type guard for RecipedItemGroup.
 * @param group - The ItemGroup to check
 * @returns True if group is RecipedItemGroup
 */
export function isRecipedItemGroup(
  group: ItemGroup,
): group is RecipedItemGroup {
  return typeof group.recipe === 'number' && !isNaN(group.recipe)
}

// Use output type for strict clipboard unions
export type SimpleItemGroup = Readonly<z.output<typeof simpleItemGroupSchema>>
export type RecipedItemGroup = Readonly<z.output<typeof recipedItemGroupSchema>>
export type ItemGroup = Readonly<z.output<typeof itemGroupSchema>>

export function isSimpleSingleGroup(
  group: ItemGroup,
): group is SimpleItemGroup {
  return isSimpleItemGroup(group) && group.items.length === 1
}

/**
 * Calculates the total quantity of an ItemGroup by summing all item quantities.
 * This replaces the deprecated quantity field that was previously stored.
 *
 * @param group - The ItemGroup to calculate quantity for
 * @returns The total quantity of all items in the group
 */
export function getItemGroupQuantity(group: ItemGroup): number {
  return group.items
    .map((item) => item.quantity)
    .reduce((acc: number, quantity) => acc + quantity, 0)
}

/**
 * Creates a new simple ItemGroup with default values.
 * Used for initializing new item groups that are not associated with a recipe.
 *
 * @param name - Name of the item group
 * @param items - Array of items in the group
 * @returns A new SimpleItemGroup
 */
export function createSimpleItemGroup({
  id,
  name,
  items = [],
}: {
  id: number
  name: string
  items?: SimpleItemGroup['items']
}): SimpleItemGroup {
  return transformItemGroup({
    id,
    name,
    items,
    recipe: undefined,
    __type: 'ItemGroup',
  })
}

/**
 * Creates a new recipe ItemGroup with default values.
 * Used for initializing new item groups that are associated with a recipe.
 *
 * @param name - Name of the item group
 * @param recipe - Recipe ID this group is associated with
 * @param items - Array of items in the group
 * @returns A new RecipedItemGroup
 */
export function createRecipedItemGroup({
  id,
  name,
  recipe,
  items = [],
}: {
  id: number
  name: string
  recipe: number
  items?: RecipedItemGroup['items']
}): RecipedItemGroup {
  return transformItemGroup({
    id,
    name,
    items,
    recipe,
    __type: 'ItemGroup',
  })
}

/**
 * Checks if a RecipedItemGroup is up to date with its associated Recipe.
 * Returns false if any item reference, quantity, or macros differ.
 *
 * @param group - The RecipedItemGroup to check
 * @param groupRecipe - The Recipe to compare against
 * @returns True if up to date
 */
export function isRecipedGroupUpToDate(
  group: RecipedItemGroup,
  groupRecipe: Recipe,
): boolean {
  if (groupRecipe.id !== group.recipe) {
    handleApiError(
      new Error(
        'Invalid state! Group recipe is not the same as the recipe in the group!',
      ),
      {
        component: 'itemGroupDomain',
        operation: 'isRecipedGroupUpToDate',
        additionalData: { groupId: group.id, groupRecipeId: groupRecipe.id },
      },
    )
    // Defensive: always throw after logging for invalid state
    throw new Error(
      'Invalid state! Group recipe is not the same as the recipe in the group!',
    )
  }
  const groupRecipeItems = groupRecipe.items
  const groupItems = group.items
  if (groupRecipeItems.length !== groupItems.length) {
    return false
  }

  for (let i = 0; i < groupRecipeItems.length; i++) {
    const recipeItem = groupRecipeItems[i]
    const groupItem = groupItems[i]

    if (recipeItem === undefined || groupItem === undefined) {
      return false
    }
    if (recipeItem.reference !== groupItem.reference) {
      return false
    }
    if (recipeItem.quantity !== groupItem.quantity) {
      return false
    }
    // TODO:   Compare macros when they are implemented in the recipe
  }
  return true
}
