import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'

const ze = createZodEntity('macroNutrients')

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
const macronutrientsEntity = ze.create({
  carbs: z
    .nan() // TODDO: Remove NaN once all data is migrated and validated (NaN occurs on CopyLastDayButton on Test user)
    .or(ze.number())
    .transform((v) => (isNaN(v) || v < 0 ? 0 : v)),
  protein: z
    .nan()
    .or(ze.number())
    .transform((v) => (isNaN(v) || v < 0 ? 0 : v)),
  fat: z
    .nan()
    .or(ze.number())
    .transform((v) => (isNaN(v) || v < 0 ? 0 : v)),
} as const)

export const { schema: macroNutrientsSchema } = macronutrientsEntity
export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>

export function createNewMacroNutrients(
  data: z.infer<typeof macronutrientsEntity.unbranded.newSchema>,
): MacroNutrients {
  return macronutrientsEntity.promote(macronutrientsEntity.createNew(data), 0)
}
