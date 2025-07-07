import type { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createTypeField,
  entityBaseSchema,
  namedEntityBaseSchema,
} from '~/shared/domain/schema/baseSchemas'
import { createNumberField } from '~/shared/domain/schema/validationMessages'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * @deprecated Use UnifiedItem instead
 */
export const itemSchema = entityBaseSchema.merge(namedEntityBaseSchema).extend({
  reference: createNumberField('id'),
  quantity: createNumberField('id'),
  /**
   * @deprecated Should be derived from the quantity and the reference
   */
  macros: macroNutrientsSchema,
  __type: createTypeField('Item'),
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
