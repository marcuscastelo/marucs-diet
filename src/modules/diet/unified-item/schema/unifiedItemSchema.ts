import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

type FoodReference = {
  type: 'food'
  id: number
  macros: z.infer<typeof macroNutrientsSchema>
}
type RecipeReference = { type: 'recipe'; id: number; children: UnifiedItem[] }
type GroupReference = { type: 'group'; children: UnifiedItem[] }

export const unifiedItemSchema: z.ZodType<UnifiedItem> = z.lazy(() =>
  z.union([
    // Food items have macros in their reference
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number(),
      reference: z.object({
        type: z.literal('food'),
        id: z.number(),
        macros: macroNutrientsSchema,
      }),
      __type: z.literal('UnifiedItem'),
    }),
    // Recipe items don't have macros (inferred from children)
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number(),
      reference: z.object({
        type: z.literal('recipe'),
        id: z.number(),
        children: z.array(unifiedItemSchema),
      }),
      __type: z.literal('UnifiedItem'),
    }),
    // Group items don't have macros (inferred from children)
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number(),
      reference: z.object({
        type: z.literal('group'),
        children: z.array(unifiedItemSchema),
      }),
      __type: z.literal('UnifiedItem'),
    }),
  ]),
)

export type UnifiedItem =
  | {
      id: number
      name: string
      quantity: number
      reference: FoodReference
      __type: 'UnifiedItem'
    }
  | {
      id: number
      name: string
      quantity: number
      reference: RecipeReference
      __type: 'UnifiedItem'
    }
  | {
      id: number
      name: string
      quantity: number
      reference: GroupReference
      __type: 'UnifiedItem'
    }

export function isFood(item: UnifiedItem): item is UnifiedItem & {
  reference: FoodReference
} {
  return item.reference.type === 'food'
}
export function isRecipe(item: UnifiedItem): item is UnifiedItem & {
  reference: RecipeReference
} {
  return item.reference.type === 'recipe'
}
export function isGroup(item: UnifiedItem): item is UnifiedItem & {
  reference: GroupReference
} {
  return item.reference.type === 'group'
}
