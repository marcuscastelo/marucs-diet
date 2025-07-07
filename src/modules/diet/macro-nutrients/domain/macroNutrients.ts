import { type z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'

const ze = createZodEntity('macroNutrients')

// TODO:   Use macroNutrientsSchema for other schemas that need macro nutrients
export const macroNutrientsSchema = ze.create({
  carbs: ze.number('carbs'),
  protein: ze.number('protein'),
  fat: ze.number('fat'),
})

export type MacroNutrients = Readonly<z.infer<typeof macroNutrientsSchema>>
