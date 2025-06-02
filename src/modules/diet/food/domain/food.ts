import { macroNutrientsSchema, type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { z } from 'zod'

export const newFoodSchema = z.object({
  name: z.string(),
  ean: z.string().nullable(),
  macros: macroNutrientsSchema,
  source: z
    .object({
      type: z.literal('api'),
      id: z.string(),
    })
    .optional(),
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
  ean: z.string().nullable(),
  macros: macroNutrientsSchema,
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
}: {
  name: string
  macros: MacroNutrients
  ean: string | null
  source?: NewFood['source']
}): NewFood {
  return {
    name,
    macros,
    ean,
    source,
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

/**
 * Demotes a Food to a NewFood for updates.
 * Used when converting a persisted Food back to NewFood for database operations.
 */
export function demoteToNewFood(food: Food): NewFood {
  return newFoodSchema.parse({
    name: food.name,
    macros: food.macros,
    ean: food.ean,
    source: food.source,
    __type: 'NewFood',
  })
}
