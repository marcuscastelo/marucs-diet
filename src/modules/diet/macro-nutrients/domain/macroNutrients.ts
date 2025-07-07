import { z } from 'zod/v4'

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
export const macroNutrientsSchema = z.object({
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
})

export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>
