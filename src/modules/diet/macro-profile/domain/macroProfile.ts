import { z } from 'zod/v4'

import {
  createDateFieldMessages,
  createNumberFieldMessages,
  createStringFieldMessages,
} from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const macroProfileSchema = z.object({
  id: z.number(createNumberFieldMessages('id')('macroProfile')),
  owner: z.number(createNumberFieldMessages('owner')('macroProfile')),
  target_day: z
    .date(createDateFieldMessages('target_day')('macroProfile'))
    .or(z.string(createStringFieldMessages('target_day')('macroProfile')))
    .transform((v) => new Date(v)),
  gramsPerKgCarbs: z.number(
    createNumberFieldMessages('gramsPerKgCarbs')('macroProfile'),
  ),
  gramsPerKgProtein: z.number(
    createNumberFieldMessages('gramsPerKgProtein')('macroProfile'),
  ),
  gramsPerKgFat: z.number(
    createNumberFieldMessages('gramsPerKgFat')('macroProfile'),
  ),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'MacroProfile' as const),
})

export const newMacroProfileSchema = macroProfileSchema
  .omit({ id: true })
  .extend({
    __type: z.literal('NewMacroProfile'),
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
