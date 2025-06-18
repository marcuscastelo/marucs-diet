import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

type FoodReference = { type: 'food'; id: number }
type RecipeReference = { type: 'recipe'; id: number; children: UnifiedItem[] }
type GroupReference = { type: 'group'; children: UnifiedItem[] }

type UnifiedReference = FoodReference | RecipeReference | GroupReference

export const unifiedItemSchema: z.ZodType<UnifiedItem> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    quantity: z.number(),
    macros: macroNutrientsSchema,
    reference: z.union([
      z.object({ type: z.literal('food'), id: z.number() }),
      z.object({
        type: z.literal('recipe'),
        id: z.number(),
        children: z.array(unifiedItemSchema),
      }),
      z.object({
        type: z.literal('group'),
        children: z.array(unifiedItemSchema),
      }),
    ]),
    __type: z.literal('UnifiedItem'),
  }),
)

export type UnifiedItem = {
  id: number
  name: string
  quantity: number
  macros: z.infer<typeof macroNutrientsSchema>
  reference: UnifiedReference
  __type: 'UnifiedItem'
}

export function isFood(
  item: UnifiedItem,
): item is UnifiedItem & { reference: FoodReference } {
  return item.reference.type === 'food'
}
export function isRecipe(
  item: UnifiedItem,
): item is UnifiedItem & { reference: RecipeReference } {
  return item.reference.type === 'recipe'
}
export function isGroup(
  item: UnifiedItem,
): item is UnifiedItem & { reference: GroupReference } {
  return item.reference.type === 'group'
}
