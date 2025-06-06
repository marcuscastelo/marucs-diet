import supabase from '~/legacy/utils/supabase'
import {
  type MacroProfile,
  type NewMacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import { type MacroProfileRepository } from '~/modules/diet/macro-profile/domain/macroProfileRepository'
import {
  createInsertMacroProfileDAOFromNewMacroProfile,
  createMacroProfileFromDAO,
  createUpdateMacroProfileDAOFromNewMacroProfile,
  macroProfileDAOSchema,
} from '~/modules/diet/macro-profile/infrastructure/macroProfileDAO'
import { type User } from '~/modules/user/domain/user'
import { handleApiError } from '~/shared/error/errorHandler'

export const SUPABASE_TABLE_MACRO_PROFILES = 'macro_profiles'

export function createSupabaseMacroProfileRepository(): MacroProfileRepository {
  return {
    fetchUserMacroProfiles,
    insertMacroProfile,
    updateMacroProfile,
    deleteMacroProfile,
  }
}

async function fetchUserMacroProfiles(userId: User['id']) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_MACRO_PROFILES)
    .select('*')
    .eq('owner', userId)
    .order('target_day', { ascending: true })

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMacroProfileRepository',
      operation: 'fetchUserMacroProfiles',
      additionalData: { userId },
    })
    throw error
  }

  const macroProfileDAOs = macroProfileDAOSchema.array().parse(data)
  return macroProfileDAOs.map(createMacroProfileFromDAO)
}

async function insertMacroProfile(
  newMacroProfile: NewMacroProfile,
): Promise<MacroProfile | null> {
  const createDAO =
    createInsertMacroProfileDAOFromNewMacroProfile(newMacroProfile)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_MACRO_PROFILES)
    .insert(createDAO)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMacroProfileRepository',
      operation: 'insertMacroProfile',
      additionalData: { macroProfile: newMacroProfile },
    })
    throw error
  }

  const macroProfileDAOs = macroProfileDAOSchema.array().parse(data)
  const macroProfiles = macroProfileDAOs.map(createMacroProfileFromDAO)

  return macroProfiles[0] ?? null
}

async function updateMacroProfile(
  profileId: MacroProfile['id'],
  newMacroProfile: NewMacroProfile,
): Promise<MacroProfile | null> {
  const updateDAO =
    createUpdateMacroProfileDAOFromNewMacroProfile(newMacroProfile)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_MACRO_PROFILES)
    .update(updateDAO)
    .eq('id', profileId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMacroProfileRepository',
      operation: 'updateMacroProfile',
      additionalData: { profileId, macroProfile: newMacroProfile },
    })
    throw error
  }

  const macroProfileDAOs = macroProfileDAOSchema.array().parse(data)
  const macroProfiles = macroProfileDAOs.map(createMacroProfileFromDAO)

  return macroProfiles[0] ?? null
}

async function deleteMacroProfile(id: MacroProfile['id']) {
  const { error } = await supabase
    .from(SUPABASE_TABLE_MACRO_PROFILES)
    .delete()
    .eq('id', id)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMacroProfileRepository',
      operation: 'deleteMacroProfile',
      additionalData: { id },
    })
    throw error
  }
}
