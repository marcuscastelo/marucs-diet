import { z } from 'zod/v4'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { createZodEntity } from '~/shared/domain/validationMessages'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('item')

/**
 * @deprecated Use UnifiedItem instead
 */
export const itemSchema = ze.create({
  id: ze.number('id'),
  name: ze.string('name'),
  reference: ze.number('reference'),
  quantity: ze.number('quantity'),
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

/**
 * @deprecated
 */
export type Item = Readonly<z.output<typeof itemSchema>>

/**
 * @deprecated
 */
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
