import { z } from 'zod'
import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { generateId } from '~/legacy/utils/idUtils'

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

export type Item = Readonly<z.infer<typeof itemSchema>>

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
  return itemSchema.parse({
    __type: 'Item',
    id: generateId(), // TODO: Remove id generation from createItem and use it only in the database
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
