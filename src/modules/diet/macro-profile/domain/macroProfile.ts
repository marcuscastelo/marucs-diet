import { z } from 'zod'

import {
  createCreatedAtField,
  createIdField,
  createNewTypeField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const macroProfileSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    target_day: z
      .date()
      .or(z.string())
      .transform((v) => new Date(v)),
    gramsPerKgCarbs: z.number(),
    gramsPerKgProtein: z.number(),
    gramsPerKgFat: z.number(),
    __type: createTypeField('MacroProfile'),
  })
  .strip()

export const newMacroProfileSchema = macroProfileSchema
  .omit({ id: true })
  .extend({
    __type: createNewTypeField('NewMacroProfile'),
  })
  .strip()

export type MacroProfile = Readonly<z.infer<typeof macroProfileSchema>>
export type NewMacroProfile = Readonly<z.infer<typeof newMacroProfileSchema>>

export function createNewMacroProfile({
  userId,
  target_day: targetDay,
  gramsPerKgCarbs,
  gramsPerKgProtein,
  gramsPerKgFat,
}: {
  userId: number
  target_day: Date | string
  gramsPerKgCarbs: number
  gramsPerKgProtein: number
  gramsPerKgFat: number
}): NewMacroProfile {
  const now = new Date()
  return parseWithStack(newMacroProfileSchema, {
    userId,
    target_day: targetDay,
    gramsPerKgCarbs,
    gramsPerKgProtein,
    gramsPerKgFat,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewMacroProfile',
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
    userId: macroProfile.userId,
    target_day: macroProfile.target_day,
    gramsPerKgCarbs: macroProfile.gramsPerKgCarbs,
    gramsPerKgProtein: macroProfile.gramsPerKgProtein,
    gramsPerKgFat: macroProfile.gramsPerKgFat,
    createdAt: macroProfile.createdAt,
    updatedAt: macroProfile.updatedAt,
    __type: 'new-NewMacroProfile',
  })
}
