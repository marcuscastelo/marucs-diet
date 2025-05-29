import {
  type MacroProfile,
  macroProfileSchema,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import { type User } from '~/modules/user/domain/user'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { type MacroProfileRepository } from '~/modules/diet/macro-profile/domain/macroProfileRepository'
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
      additionalData: { userId }
    })
    throw error
  }

  return macroProfileSchema.array().parse(data)
}

async function insertMacroProfile(newMacroProfile: DbReady<MacroProfile>) {
  const macroProfile = enforceDbReady(newMacroProfile)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_MACRO_PROFILES)
    .insert(macroProfile)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMacroProfileRepository',
      operation: 'insertMacroProfile',
      additionalData: { macroProfile }
    })
    throw error
  }

  return macroProfileSchema.parse(data?.[0])
}

async function updateMacroProfile(
  profileId: MacroProfile['id'],
  newMacroProfile: DbReady<MacroProfile>,
) {
  const macroProfile = enforceDbReady(newMacroProfile)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_MACRO_PROFILES)
    .update(macroProfile)
    .eq('id', profileId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMacroProfileRepository',
      operation: 'updateMacroProfile',
      additionalData: { profileId, macroProfile }
    })
    throw error
  }

  return macroProfileSchema.parse(data?.[0])
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
      additionalData: { id }
    })
    throw error
  }
}
