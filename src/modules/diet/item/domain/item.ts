import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createCreatedAtField,
  createDescriptionField,
  createIdField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import {
  createNumberField,
  createStringField,
} from '~/shared/domain/schema/validationMessages'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * @deprecated Use UnifiedItem instead
 */
export const itemSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createStringField('name'),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    reference: createNumberField('id'),
    quantity: createNumberField('id'),
    /**
     * @deprecated Should be derived from the quantity and the reference
     */
    macros: macroNutrientsSchema,
    __type: createTypeField('Item'),
  })
  .strip()

/**
 * @deprecated
 */
export type Item = Readonly<z.output<typeof itemSchema>>

/**
 * @deprecated
 */
export function createItem({
  userId = 1,
  name,
  description = null,
  reference,
  quantity = 0,
  macros = {},
}: {
  userId?: number
  name: string
  description?: string | null
  reference: number
  quantity?: number
  macros?: Partial<Item['macros']>
}) {
  const now = new Date()
  return parseWithStack(itemSchema, {
    __type: 'Item',
    id: generateId(), // TODO:   Remove id generation from createItem and use it only in the database
    userId,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    reference,
    quantity,
    macros: {
      protein: macros.protein ?? 0,
      carbs: macros.carbs ?? 0,
      fat: macros.fat ?? 0,
    },
  } satisfies Item)
}
