import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

type FoodReference = {
  type: 'food'
  id: number
  macros: z.infer<typeof macroNutrientsSchema>
}
type RecipeReference = { type: 'recipe'; id: number; children: UnifiedItem[] }
type GroupReference = { type: 'group'; children: UnifiedItem[] }

type Reference<T extends 'food' | 'recipe' | 'group'> = T extends 'food'
  ? FoodReference
  : T extends 'recipe'
    ? RecipeReference
    : T extends 'group'
      ? GroupReference
      : T extends 'recipe' | 'group'
        ? { type: T; children: UnifiedItem[] }
        : never

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

type UnifiedItemBase = {
  id: number
  name: string
  quantity: number
  __type: 'UnifiedItem'
}

export type UnifiedItem<
  T extends 'food' | 'recipe' | 'group' = 'food' | 'recipe' | 'group',
> = UnifiedItemBase & {
  __type: 'UnifiedItem'
  reference: Reference<T>
}

export function isFood(item: UnifiedItem): item is UnifiedItem<'food'> & {
  reference: FoodReference
} {
  return item.reference.type === 'food'
}
export function isRecipe(item: UnifiedItem): item is UnifiedItem<'recipe'> {
  return item.reference.type === 'recipe'
}
export function isGroup(item: UnifiedItem): item is UnifiedItem<'group'> {
  return item.reference.type === 'group'
}
export function asFoodItem(item: UnifiedItem): UnifiedItem<'food'> | undefined {
  return isFood(item) ? item : undefined
}
export function asRecipeItem(
  item: UnifiedItem,
): UnifiedItem<'recipe'> | undefined {
  return isRecipe(item) ? item : undefined
}
export function asGroupItem(
  item: UnifiedItem,
): UnifiedItem<'group'> | undefined {
  return isGroup(item) ? item : undefined
}

export function createUnifiedItem({
  id,
  name,
  quantity,
  reference,
}: Omit<UnifiedItem, '__type'>): UnifiedItem {
  const itemWithoutReference: Omit<UnifiedItem, 'reference'> = {
    id,
    name,
    quantity: Math.round(quantity * 100) / 100, // Round to 2 decimal places
    __type: 'UnifiedItem',
  }

  if (reference.type === 'food') {
    return {
      ...itemWithoutReference,
      reference: {
        type: 'food',
        id: reference.id,
        macros: reference.macros,
      } satisfies FoodReference,
    }
  }

  if (reference.type === 'recipe') {
    return {
      ...itemWithoutReference,
      reference: {
        type: 'recipe',
        id: reference.id,
        children: reference.children.map((child) => {
          return createUnifiedItem(child)
        }),
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (reference.type === 'group') {
    return {
      ...itemWithoutReference,
      reference: {
        type: 'group',
        children: reference.children.map((child) => {
          return createUnifiedItem(child)
        }),
      },
    }
  }

  reference satisfies never // Ensure TypeScript narrows down the type
  // @ts-expect-error Property 'type' does not exist on type 'never'.ts(2339)
  throw new Error(`Unknown reference type: ${reference.type}`) // Fallback for safety
}
