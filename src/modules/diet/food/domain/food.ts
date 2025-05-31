import { macroNutrientsSchema, type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { z } from 'zod'

export const newFoodSchema = z.object({
  name: z.string(),
  ean: z.string().optional(),
  macros: macroNutrientsSchema,
  source: z
    .object({
      type: z.literal('api'),
      id: z.string(),
    })
    .optional(),
  recipeId: z.number().optional(),
  __type: z.literal('NewFood'),
})

export const foodSchema = z.object({
  id: z.number(),
  source: z
    .object({
      type: z.literal('api'),
      id: z.string(),
    })
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  name: z.string(),
  ean: z
    .string()
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  macros: macroNutrientsSchema,
  recipeId: z
    .number()
    .nullable()
    .transform((val) => val ?? undefined)
    .optional(),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Food' as const),
})

export type NewFood = Readonly<z.infer<typeof newFoodSchema>>
export type Food = Readonly<z.infer<typeof foodSchema>>

/**
 * Creates a new NewFood.
 * Used for initializing new foods before saving to database.
 */
export function createNewFood({
  name,
  macros,
  ean,
  source,
  recipeId,
}: {
  name: string
  macros: MacroNutrients
  ean?: string
  source?: NewFood['source']
  recipeId?: number
}): NewFood {
  return {
    name,
    macros,
    ean,
    source,
    recipeId,
    __type: 'NewFood',
  }
}

/**
 * Promotes a NewFood to a Food after persistence.
 */
export function promoteToFood(newFood: NewFood, id: number): Food {
  return {
    ...newFood,
    id,
    __type: 'Food',
  }
}

// TODO: Make createFood function more than a mock
export function createFood({ name }: { name: string }): NewFood {
  return createNewFood({
    name,
    macros: {
      protein: 1234,
      carbs: 4321,
      fat: 666,
    },
  })
}
