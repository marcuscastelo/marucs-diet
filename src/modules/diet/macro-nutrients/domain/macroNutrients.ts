import { type z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'

const ze = createZodEntity('macroNutrients')

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
const macronutrientsEntity = ze.create({
  carbs: ze.number().nonnegative(),
  protein: ze.number().nonnegative(),
  fat: ze.number().nonnegative(),
} as const)

export const { schema: macroNutrientsSchema } = macronutrientsEntity
export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>

export function createNewMacroNutrients(
  data: z.infer<typeof macronutrientsEntity.unbranded.newSchema>,
): MacroNutrients {
  return macronutrientsEntity.promote(macronutrientsEntity.createNew(data), 0)
}
