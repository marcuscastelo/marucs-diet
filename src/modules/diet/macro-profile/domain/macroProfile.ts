import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validation'

const ze = createZodEntity('macroProfile')

export const {
  schema: macroProfileSchema,
  newSchema: newMacroProfileSchema,
  createNew: createNewMacroProfile,
  promote: promoteToMacroProfile,
  demote: demoteToNewMacroProfile,
} = ze.create({
  id: ze.number(),
  owner: ze.number(),
  target_day: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  gramsPerKgCarbs: ze.number().transform((v) => (isNaN(v) || v < 0 ? 0 : v)),
  gramsPerKgProtein: ze.number().transform((v) => (isNaN(v) || v < 0 ? 0 : v)),
  gramsPerKgFat: ze.number().transform((v) => (isNaN(v) || v < 0 ? 0 : v)),
})

export type MacroProfile = Readonly<z.infer<typeof macroProfileSchema>>
export type NewMacroProfile = Readonly<z.infer<typeof newMacroProfileSchema>>
