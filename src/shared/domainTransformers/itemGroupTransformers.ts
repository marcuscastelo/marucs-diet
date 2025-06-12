import { itemSchema } from '~/modules/diet/item/domain/item'
import { parseWithStack } from '~/shared/utils/parseWithStack'
import { z } from 'zod'

export const simpleItemGroupTransformSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: itemSchema.array(),
  recipe: z
    .number()
    .nullable()
    .optional()
    .transform((recipe) => recipe ?? undefined),
  __type: z.literal('ItemGroup').optional().default('ItemGroup'),
})

export const recipedItemGroupTransformSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: itemSchema.array().readonly(),
  recipe: z.number(),
  __type: z.literal('ItemGroup').default('ItemGroup'),
})

export function transformItemGroup(input: unknown) {
  if (
    typeof input === 'object' &&
    input !== null &&
    'recipe' in input &&
    typeof (input as { recipe?: unknown }).recipe === 'number'
  ) {
    const { id, name, items, recipe } = input as {
      id: number
      name: string
      items: unknown[]
      recipe: number
    }
    return parseWithStack(recipedItemGroupTransformSchema, {
      id,
      name,
      items: Array.isArray(items) ? [...items] : [],
      recipe,
      __type: 'ItemGroup',
    })
  } else if (
    typeof input === 'object' &&
    input !== null &&
    'id' in input &&
    'name' in input &&
    'items' in input
  ) {
    const { id, name, items } = input as {
      id: number
      name: string
      items: unknown[]
    }
    return parseWithStack(simpleItemGroupTransformSchema, {
      id,
      name,
      items: Array.isArray(items) ? [...items] : [],
      recipe: undefined,
      __type: 'ItemGroup',
    })
  }
  throw new Error('Invalid input for transformItemGroup')
}
