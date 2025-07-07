import { z } from 'zod'

const numberOrNaN = z.union([z.number(), z.nan()])

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
export const macroNutrientsSchema = z.object({
  carbs: numberOrNaN,
  protein: numberOrNaN,
  fat: numberOrNaN,
})

export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>
