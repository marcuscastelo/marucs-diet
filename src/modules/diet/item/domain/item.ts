import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const itemSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' é obrigatório.",
    invalid_type_error: "O campo 'id' deve ser um número.",
  }),
  name: z.string({
    required_error: "O campo 'name' é obrigatório.",
    invalid_type_error: "O campo 'name' deve ser uma string.",
  }),
  reference: z.number({
    required_error: "O campo 'reference' é obrigatório.",
    invalid_type_error: "O campo 'reference' deve ser um número.",
  }),
  quantity: z.number({
    required_error: "O campo 'quantity' é obrigatório.",
    invalid_type_error: "O campo 'quantity' deve ser um número.",
  }),
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
