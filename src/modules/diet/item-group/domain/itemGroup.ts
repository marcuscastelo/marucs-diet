import { z } from 'zod'
import { foodItemSchema } from '@/modules/diet/food-item/domain/foodItem'

// TODO: Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types)
// TODO: In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106)

export const simpleItemGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: foodItemSchema.array(), // TODO: Support nested groups and recipes
  quantity: z.number(), // TODO: Replace quantity field with a getter that calculates it
  type: z.literal('simple'),
  recipe: z
    .number()
    .nullable()
    .optional()
    .transform((recipe) => recipe ?? undefined),
})

export const recipedItemGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: foodItemSchema.array().readonly(), // TODO: Support nested groups and recipes
  quantity: z.number(), // TODO: Replace quantity field with a getter that calculates it
  type: z.literal('recipe'),
  recipe: z.number(),
})

export const itemGroupSchema = z.discriminatedUnion('type', [
  simpleItemGroupSchema,
  recipedItemGroupSchema,
])

export type SimpleItemGroup = Readonly<z.infer<typeof simpleItemGroupSchema>>

export type RecipedItemGroup = Readonly<z.infer<typeof recipedItemGroupSchema>>

export type ItemGroup = Readonly<z.infer<typeof itemGroupSchema>>

export function isSimpleSingleGroup(
  group: ItemGroup,
): group is SimpleItemGroup {
  return group.type === 'simple' && group.items.length === 1
}
