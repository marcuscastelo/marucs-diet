import { z } from 'zod'

import { generateId } from '~/legacy/utils/idUtils'
import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const recipeItemSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' do item de receita é obrigatório.",
    invalid_type_error: "O campo 'id' do item de receita deve ser um número.",
  }),
  name: z.string({
    required_error: "O campo 'name' do item de receita é obrigatório.",
    invalid_type_error:
      "O campo 'name' do item de receita deve ser uma string.",
  }),
  reference: z.number({
    required_error: "O campo 'reference' do item de receita é obrigatório.",
    invalid_type_error:
      "O campo 'reference' do item de receita deve ser um número.",
  }),
  quantity: z.number({
    required_error: "O campo 'quantity' do item de receita é obrigatório.",
    invalid_type_error:
      "O campo 'quantity' do item de receita deve ser um número.",
  }),
  /**
   * TODO: Calculate macros based on the quantity and reference.
   * @deprecated Should be derived from the quantity and the reference
   */
  macros: macroNutrientsSchema, // TODO:   Rename to foodMacros for clarity
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'RecipeItem' as const),
})

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
