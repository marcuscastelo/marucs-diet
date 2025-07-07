import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

/**
 * Base schema for entities that contain macro nutrients.
 * Standardizes macroNutrientsSchema usage across the codebase (resolves Issue #600).
 */
export const macroNutrientsBaseSchema = z.object({
  macros: macroNutrientsSchema,
})

export type MacroNutrientsBase = z.infer<typeof macroNutrientsBaseSchema>
