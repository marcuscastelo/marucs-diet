import { z } from 'zod'
import { itemSchema } from '~/modules/diet/item/domain/item'
import { generateId } from '~/legacy/utils/idUtils'

// TODO: Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types)
// TODO: In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106)

export const simpleItemGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: itemSchema.array(), // TODO: Support nested groups and recipes
  quantity: z.number(), // TODO: Replace quantity field with a getter that calculates it
  groupType: z.literal('simple'),
  recipe: z
    .number()
    .nullable()
    .optional()
    .transform((recipe) => recipe ?? undefined),
  __type: z.literal('ItemGroup'),
})

export const recipedItemGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: itemSchema.array().readonly(), // TODO: Support nested groups and recipes
  quantity: z.number(), // TODO: Replace quantity field with a getter that calculates it
  groupType: z.literal('recipe'),
  recipe: z.number(),
  __type: z.literal('ItemGroup'),
})

export const itemGroupSchema = z.discriminatedUnion('groupType', [
  simpleItemGroupSchema,
  recipedItemGroupSchema,
])

export type SimpleItemGroup = Readonly<z.infer<typeof simpleItemGroupSchema>>

export type RecipedItemGroup = Readonly<z.infer<typeof recipedItemGroupSchema>>

export type ItemGroup = Readonly<z.infer<typeof itemGroupSchema>>

export function isSimpleSingleGroup(
  group: ItemGroup,
): group is SimpleItemGroup {
  return group.groupType === 'simple' && group.items.length === 1
}

/**
 * Creates a new simple ItemGroup with default values.
 * Used for initializing new item groups that are not associated with a recipe.
 *
 * @param name - Name of the item group
 * @param items - Array of items in the group
 * @param quantity - Quantity of the group (default: 1)
 * @returns A new SimpleItemGroup
 */
export function createSimpleItemGroup({
  name,
  items = [],
  quantity = 1,
}: {
  name: string
  items?: SimpleItemGroup['items']
  quantity?: number
}): SimpleItemGroup {
  return {
    id: generateId(),
    name,
    items,
    quantity,
    groupType: 'simple',
    recipe: undefined,
    __type: 'ItemGroup',
  }
}

/**
 * Creates a new recipe ItemGroup with default values.
 * Used for initializing new item groups that are associated with a recipe.
 *
 * @param name - Name of the item group
 * @param recipe - Recipe ID this group is associated with
 * @param items - Array of items in the group
 * @param quantity - Quantity of the group (default: 1)
 * @returns A new RecipedItemGroup
 */
export function createRecipedItemGroup({
  name,
  recipe,
  items = [],
  quantity = 1,
}: {
  name: string
  recipe: number
  items?: RecipedItemGroup['items']
  quantity?: number
}): RecipedItemGroup {
  return {
    id: generateId(),
    name,
    items,
    quantity,
    groupType: 'recipe',
    recipe,
    __type: 'ItemGroup',
  }
}
