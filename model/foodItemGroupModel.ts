import { z } from 'zod'
import { itemSchema } from './foodItemModel'

// TODO: Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types)
// TODO: In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106)

export const simpleItemGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: itemSchema.array(),
  quantity: z.number(),
  type: z.literal('simple'),
  recipe: z
    .number()
    .nullable()
    .optional()
    .transform((recipe) => recipe ?? undefined),
})

export const recipedItemGroup = z.object({
  id: z.number(),
  name: z.string(),
  items: itemSchema.array(),
  quantity: z.number(),
  type: z.literal('recipe'),
  recipe: z.number(),
})

export const itemGroupSchema = z.discriminatedUnion('type', [
  simpleItemGroupSchema,
  recipedItemGroup,
])

export type SimpleItemGroup = z.infer<typeof simpleItemGroupSchema>

export type RecipedItemGroup = z.infer<typeof recipedItemGroup>

// TODO: rename ItemGroup component to ItemGroupView
export type ItemGroup = z.infer<typeof itemGroupSchema>

export function isGroupSingleItem(group: ItemGroup) {
  return group.items.length === 1
}
