import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('macroProfile')

export const macroProfileSchema = ze.create({
  id: ze.number('id'),
  owner: ze.number('owner'),
  target_day: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  gramsPerKgCarbs: ze.number('gramsPerKgCarbs'),
  gramsPerKgProtein: ze.number('gramsPerKgProtein'),
  gramsPerKgFat: ze.number('gramsPerKgFat'),
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
