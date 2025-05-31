import { z } from 'zod'

export const macroProfileSchema = z.object({
  id: z.number(),
  owner: z.number(),
  target_day: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  gramsPerKgCarbs: z.number(),
  gramsPerKgProtein: z.number(),
  gramsPerKgFat: z.number(),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'MacroProfile' as const),
})

export const newMacroProfileSchema = macroProfileSchema.omit({ id: true }).extend({
  __type: z.literal('NewMacroProfile'),
})

export type MacroProfile = Readonly<z.infer<typeof macroProfileSchema>>
export type NewMacroProfile = Readonly<z.infer<typeof newMacroProfileSchema>>

export function createNewMacroProfile({
  owner,
  target_day,
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
  return newMacroProfileSchema.parse({
    owner,
    target_day,
    gramsPerKgCarbs,
    gramsPerKgProtein,
    gramsPerKgFat,
    __type: 'NewMacroProfile',
  })
}

export function promoteToMacroProfile(newMacroProfile: NewMacroProfile, id: number): MacroProfile {
  return macroProfileSchema.parse({
    ...newMacroProfile,
    id,
    __type: 'MacroProfile',
  })
}

/**
 * Demotes a MacroProfile to a NewMacroProfile for updates.
 * Used when converting a persisted MacroProfile back to NewMacroProfile for database operations.
 */
export function demoteToNewMacroProfile(macroProfile: MacroProfile): NewMacroProfile {
  return newMacroProfileSchema.parse({
    owner: macroProfile.owner,
    target_day: macroProfile.target_day,
    gramsPerKgCarbs: macroProfile.gramsPerKgCarbs,
    gramsPerKgProtein: macroProfile.gramsPerKgProtein,
    gramsPerKgFat: macroProfile.gramsPerKgFat,
    __type: 'NewMacroProfile',
  })
}
