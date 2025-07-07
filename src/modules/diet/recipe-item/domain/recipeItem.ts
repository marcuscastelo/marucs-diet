import { z } from 'zod/v4'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createIdField,
  createNameField,
  createQuantityField,
  createReferenceField,
} from '~/shared/domain/commonFields'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * @deprecated
 */
export const recipeItemSchema = z.object({
  id: createIdField('recipeItem'),
  name: createNameField('recipeItem'),
  reference: createReferenceField('recipeItem'),
  quantity: createQuantityField('recipeItem'),
  macros: macroNutrientsSchema, // TODO:   Rename to foodMacros for clarity
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'RecipeItem' as const),
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
