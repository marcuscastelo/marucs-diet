import { z } from 'zod/v4'

import {
  createCarbsField,
  createFatField,
  createProteinField,
} from '~/shared/domain/commonFields'

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
export const macroNutrientsSchema = z.object({
  carbs: createCarbsField('macroNutrients'),
  protein: createProteinField('macroNutrients'),
  fat: createFatField('macroNutrients'),
})

export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>
