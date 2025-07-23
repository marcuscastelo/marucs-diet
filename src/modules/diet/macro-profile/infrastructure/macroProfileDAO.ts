import { z } from 'zod/v4'

import {
  type MacroProfile,
  macroProfileSchema,
  type NewMacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// DAO schemas for database operations
export const createMacroProfileDAOSchema = z.object({
  owner: z.number(),
  target_day: z.date().or(z.string()),
  gramsPerKgCarbs: z.number(),
  gramsPerKgProtein: z.number(),
  gramsPerKgFat: z.number(),
})

export const macroProfileDAOSchema = createMacroProfileDAOSchema.extend({
  id: z.number(),
})

export type CreateMacroProfileDAO = z.infer<typeof createMacroProfileDAOSchema>
export type MacroProfileDAO = z.infer<typeof macroProfileDAOSchema>

// Conversion functions
export function createInsertMacroProfileDAOFromNewMacroProfile(
  newMacroProfile: NewMacroProfile,
): CreateMacroProfileDAO {
  return {
    owner: newMacroProfile.owner,
    target_day: newMacroProfile.target_day,
    gramsPerKgCarbs: newMacroProfile.gramsPerKgCarbs,
    gramsPerKgProtein: newMacroProfile.gramsPerKgProtein,
    gramsPerKgFat: newMacroProfile.gramsPerKgFat,
  }
}

export function createUpdateMacroProfileDAOFromNewMacroProfile(
  newMacroProfile: NewMacroProfile,
): CreateMacroProfileDAO {
  return createInsertMacroProfileDAOFromNewMacroProfile(newMacroProfile)
}

export function createMacroProfileFromDAO(dao: MacroProfileDAO): MacroProfile {
  return parseWithStack(macroProfileSchema, {
    id: dao.id,
    owner: dao.owner,
    target_day: new Date(dao.target_day),
    gramsPerKgCarbs: dao.gramsPerKgCarbs,
    gramsPerKgProtein: dao.gramsPerKgProtein,
    gramsPerKgFat: dao.gramsPerKgFat,
  })
}
