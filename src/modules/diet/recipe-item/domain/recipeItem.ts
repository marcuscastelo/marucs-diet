import { z } from 'zod'
import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { generateId } from '~/legacy/utils/idUtils'

export const recipeItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  reference: z.number(),
  quantity: z.number(),
  macros: macroNutrientsSchema,
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
  return recipeItemSchema.parse({
    __type: 'RecipeItem',
    id: generateId(), // TODO: Remove id generation from createRecipeItem and use it only in the database
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
