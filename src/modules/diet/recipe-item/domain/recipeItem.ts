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
 * @deprecated
 */
export const recipeItemSchema = entityBaseSchema
  .merge(namedEntityBaseSchema)
  .extend({
    reference: createNumberField('id'),
    quantity: createNumberField('id'),
    macros: macroNutrientsSchema, // TODO:   Rename to foodMacros for clarity
    __type: createTypeField('RecipeItem'),
  })

/**
 * @deprecated
 */
export type RecipeItem = Readonly<z.infer<typeof recipeItemSchema>>

export function createRecipeItem({
  name,
  reference,
  quantity = 0,
  macros = {},
}: {
  name: string
  reference: number
  quantity?: number
  macros?: Partial<RecipeItem['macros']>
}) {
  return parseWithStack(recipeItemSchema, {
    __type: 'RecipeItem',
    id: generateId(), // TODO:   Remove id generation from createRecipeItem and use it only in the database
    name,
    reference,
    quantity,
    macros: {
      protein: macros.protein ?? 0,
      carbs: macros.carbs ?? 0,
      fat: macros.fat ?? 0,
    },
  } satisfies RecipeItem)
}
