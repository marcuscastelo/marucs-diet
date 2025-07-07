import { z } from 'zod/v4'

import { createNumberFieldMessages } from '~/shared/domain/validationMessages'

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
export const macroNutrientsSchema = z.object({
  carbs: z.number(createNumberFieldMessages('carbs')('macroNutrients')),
  protein: z.number(createNumberFieldMessages('protein')('macroNutrients')),
  fat: z.number(createNumberFieldMessages('fat')('macroNutrients')),
})

export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>
