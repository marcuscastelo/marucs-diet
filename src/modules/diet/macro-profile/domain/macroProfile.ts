import { z } from 'zod/v4'

import {
  createGramsPerKgCarbsField,
  createGramsPerKgFatField,
  createGramsPerKgProteinField,
  createIdField,
  createNewTypeField,
  createOwnerField,
  createTargetDayField,
  createTypeField,
} from '~/shared/domain/commonFields'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const macroProfileSchema = z.object({
  id: createIdField('macroProfile'),
  owner: createOwnerField('macroProfile'),
  target_day: createTargetDayField('macroProfile'),
  gramsPerKgCarbs: createGramsPerKgCarbsField('macroProfile'),
  gramsPerKgProtein: createGramsPerKgProteinField('macroProfile'),
  gramsPerKgFat: createGramsPerKgFatField('macroProfile'),
  __type: createTypeField('MacroProfile' as const),
})

export const newMacroProfileSchema = macroProfileSchema
  .omit({ id: true })
  .extend({
    __type: createNewTypeField('NewMacroProfile'),
  })

export type MacroProfile = Readonly<z.infer<typeof macroProfileSchema>>
export type NewMacroProfile = Readonly<z.infer<typeof newMacroProfileSchema>>

export function createNewMacroProfile({
  owner,
  target_day: targetDay,
  gramsPerKgCarbs,
  gramsPerKgProtein,
  gramsPerKgFat,
}: {
  owner: number
  target_day: Date | string
  gramsPerKgCarbs: number
  gramsPerKgProtein: number
  gramsPerKgFat: number
}): NewMacroProfile {
  return parseWithStack(newMacroProfileSchema, {
    owner,
    target_day: targetDay,
    gramsPerKgCarbs,
    gramsPerKgProtein,
    gramsPerKgFat,
    __type: 'NewMacroProfile',
  })
}
