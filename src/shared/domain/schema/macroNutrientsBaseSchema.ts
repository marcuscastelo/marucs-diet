import { z } from 'zod'

import { macroNutrientsSchema } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

/**
 * Creates a macro nutrients field using the standardized schema.
 * Standardizes macroNutrientsSchema usage across the codebase (resolves Issue #600).
 */
export function createMacroNutrientsField() {
  return macroNutrientsSchema
}
