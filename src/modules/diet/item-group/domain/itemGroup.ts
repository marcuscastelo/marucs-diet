import { z } from 'zod/v4'

import { itemSchema } from '~/modules/diet/item/domain/item'
import { createZodEntity } from '~/shared/domain/validation'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('ItemGroup')

export const { schema: simpleItemGroupSchema } = ze.create({
  id: ze.number(),
  name: ze.string(),
  items: ze.array(itemSchema),
  recipe: z
    .number()
    .nullable()
    .optional()
    .transform((recipe) => recipe ?? undefined),
  __type: z.literal('ItemGroup').optional().default('ItemGroup'),
})

export const { schema: recipedItemGroupSchema } = ze.create({
  id: ze.number(),
  name: ze.string(),
  items: ze
    .array(itemSchema)
    .refine((arr) => Array.isArray(arr) && arr.length > 0, {
      message:
        "O campo 'items' do grupo deve ser uma lista de itens e não pode ser vazio.",
    })
    .readonly(),
  recipe: ze.number(),
  __type: z.literal('ItemGroup').default('ItemGroup'),
})

/**
 * @deprecated
 */
export const itemGroupSchema = z.union([
  simpleItemGroupSchema,
  recipedItemGroupSchema,
])

// Use output type for strict clipboard unions
/**
 * @deprecated
 */
type SimpleItemGroup = Readonly<z.output<typeof simpleItemGroupSchema>>
/**
 * @deprecated
 */
type RecipedItemGroup = Readonly<z.output<typeof recipedItemGroupSchema>>
/**
 * @deprecated
 */
export type ItemGroup = Readonly<z.output<typeof itemGroupSchema>>

/**
 * Calculates the total quantity of an ItemGroup by summing all item quantities.
 * This replaces the deprecated quantity field that was previously stored.
 *
 * @deprecated
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
 * @deprecated
 * @param name - Name of the item group
 * @param items - Array of items in the group
 * @returns A new SimpleItemGroup
 */
export function createSimpleItemGroup({
  name,
  items = [],
}: {
  name: string
  items?: SimpleItemGroup['items']
}): SimpleItemGroup {
  return parseWithStack(simpleItemGroupSchema, {
    id: generateId(),
    name,
    items,
    recipe: undefined,
    __type: 'itemGroup',
  })
}

/**
 * Creates a new recipe ItemGroup with default values.
 * Used for initializing new item groups that are associated with a recipe.
 *
 * @deprecated
 * @param name - Name of the item group
 * @param recipe - Recipe ID this group is associated with
 * @param items - Array of items in the group
 * @returns A new RecipedItemGroup
 */
export function createRecipedItemGroup({
  name,
  recipe,
  items = [],
}: {
  name: string
  recipe: number
  items?: RecipedItemGroup['items']
}): RecipedItemGroup {
  return parseWithStack(recipedItemGroupSchema, {
    id: generateId(),
    name,
    items,
    recipe,
    __type: 'itemGroup',
  })
}
