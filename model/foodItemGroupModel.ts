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

// TODO: rename FoodItemGroup component to ItemGroupView
export type FoodItemGroup = z.infer<typeof itemGroupSchema>

export function isGroupSingleItem(group: FoodItemGroup) {
  return group.items.length === 1
}
