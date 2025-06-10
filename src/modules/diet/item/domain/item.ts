import { z } from 'zod'

import { generateId } from '~/legacy/utils/idUtils'
import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  reference: z.number(),
  quantity: z.number(),
  /**
   * @deprecated Should be derived from the quantity and the reference
   */
  macros: macroNutrientsSchema,
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Item' as const),
})

export type Item = Readonly<z.output<typeof itemSchema>>

export function createItem({
  name,
  reference,
  quantity = 0,
  macros = {},
}: {
  name: string
  reference: number
  quantity?: number
  macros?: Partial<Item['macros']>
}) {
  return parseWithStack(itemSchema, {
    __type: 'Item',
    id: generateId(), // TODO:   Remove id generation from createItem and use it only in the database
    name,
    reference,
    quantity,
    macros: {
      protein: macros.protein ?? 0,
      carbs: macros.carbs ?? 0,
      fat: macros.fat ?? 0,
    },
  } satisfies Item)
}
