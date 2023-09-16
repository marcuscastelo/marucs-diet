import { z } from 'zod'
import { foodItemSchema } from './foodItemModel'

// TODO: Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types)
// TODO: In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106)

export const simpleItemGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: foodItemSchema.array(), // TODO: Support nested groups and recipes
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
  items: foodItemSchema.array(), // TODO: Support nested groups and recipes
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

export type ItemGroup = z.infer<typeof itemGroupSchema>

export function isSimpleSingleGroup(
  group: ItemGroup,
): group is SimpleItemGroup {
  return group.type === 'simple' && group.items.length === 1
}
