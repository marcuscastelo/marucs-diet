import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createCreatedAtField,
  createDescriptionField,
  createIdField,
  createNameField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { createNumberField } from '~/shared/domain/schema/validationMessages'
import { generateId } from '~/shared/utils/idUtils'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * @deprecated
 */
export const recipeItemSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createNameField(),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    reference: createNumberField('id'),
    quantity: createNumberField('id'),
    macros: macroNutrientsSchema, // TODO:   Rename to foodMacros for clarity
    __type: createTypeField('RecipeItem'),
  })
  .strip()

/**
 * @deprecated
 */
export type RecipeItem = Readonly<z.infer<typeof recipeItemSchema>>

export function createRecipeItem({
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
  macros?: Partial<RecipeItem['macros']>
}) {
  const now = new Date()
  return parseWithStack(recipeItemSchema, {
    __type: 'RecipeItem',
    id: generateId(), // TODO:   Remove id generation from createRecipeItem and use it only in the database
    userId,
    name,
    description,
    reference,
    quantity,
    createdAt: now,
    updatedAt: now,
    macros: {
      protein: macros.protein ?? 0,
      carbs: macros.carbs ?? 0,
      fat: macros.fat ?? 0,
    },
  } satisfies RecipeItem)
}
