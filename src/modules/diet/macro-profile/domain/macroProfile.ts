import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'

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
  gramsPerKgCarbs: ze.number(),
  gramsPerKgProtein: ze.number(),
  gramsPerKgFat: ze.number(),
})

export type MacroProfile = Readonly<z.infer<typeof macroProfileSchema>>
export type NewMacroProfile = Readonly<z.infer<typeof newMacroProfileSchema>>
