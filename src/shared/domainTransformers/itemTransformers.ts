import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const itemTransformSchema = z.object({
  id: z.number(),
  name: z.string(),
  reference: z.number(),
  quantity: z.number(),
  macros: macroNutrientsSchema,
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Item' as const),
})

export function transformItem(input: unknown) {
  if (
    typeof input === 'object' &&
    input !== null &&
    'id' in input &&
    'name' in input &&
    'reference' in input &&
    'quantity' in input &&
    'macros' in input
  ) {
    return parseWithStack(itemTransformSchema, { ...input, __type: 'Item' })
  }
  throw new Error('Invalid input for transformItem')
}
