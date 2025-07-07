import { z } from 'zod'

import {
  createNewTypeField,
  createTypeField,
  entityBaseSchema,
  ownedEntityBaseSchema,
} from '~/shared/domain/schema/baseSchemas'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const macroProfileSchema = entityBaseSchema
  .merge(ownedEntityBaseSchema)
  .extend({
    target_day: z
      .date()
      .or(z.string())
      .transform((v) => new Date(v)),
    gramsPerKgCarbs: z.number(),
    gramsPerKgProtein: z.number(),
    gramsPerKgFat: z.number(),
    __type: createTypeField('MacroProfile'),
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

export function promoteToMacroProfile(
  newMacroProfile: NewMacroProfile,
  id: number,
): MacroProfile {
  return parseWithStack(macroProfileSchema, {
    ...newMacroProfile,
    id,
    __type: 'MacroProfile',
  })
}

/**
 * Demotes a MacroProfile to a NewMacroProfile for updates.
 * Used when converting a persisted MacroProfile back to NewMacroProfile for database operations.
 */
export function demoteToNewMacroProfile(
  macroProfile: MacroProfile,
): NewMacroProfile {
  return parseWithStack(newMacroProfileSchema, {
    owner: macroProfile.owner,
    target_day: macroProfile.target_day,
    gramsPerKgCarbs: macroProfile.gramsPerKgCarbs,
    gramsPerKgProtein: macroProfile.gramsPerKgProtein,
    gramsPerKgFat: macroProfile.gramsPerKgFat,
    __type: 'NewMacroProfile',
  })
}
