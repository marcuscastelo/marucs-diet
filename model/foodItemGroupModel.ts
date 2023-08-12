import { z } from 'zod'
import { itemSchema } from './foodItemModel'

// TODO: Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types)
// TODO: In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106)
export const itemGroupSchema = z.discriminatedUnion('type', [
  z.object({
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
  }),
  z.object({
    id: z.number(),
    name: z.string(),
    items: itemSchema.array(),
    quantity: z.number(),
    type: z.literal('recipe'),
    recipe: z.number(),
  }),
])

// TODO: rename ItemGroup component to ItemGroupView
export type ItemGroup = z.infer<typeof itemGroupSchema>

export function isGroupSingleItem(group: ItemGroup) {
  return group.items.length === 1
}
