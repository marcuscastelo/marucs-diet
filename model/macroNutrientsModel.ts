import { z } from 'zod'

export const macroNutrientsSchema = z.object({
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
})

export type MacroNutrientsData = z.infer<typeof macroNutrientsSchema>
