import {
  type MacroProfile,
  macroProfileSchema,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import { type User } from '~/modules/user/domain/user'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { type MacroProfileRepository } from '~/modules/diet/macro-profile/domain/macroProfileRepository'

const TABLE = 'macro_profiles'

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
    .from(TABLE)
    .select('*')
    .eq('owner', userId)
    .order('target_day', { ascending: true })

  if (error !== null) {
    console.error(error)
    throw error
  }

  return macroProfileSchema.array().parse(data)
}

async function insertMacroProfile(newMacroProfile: DbReady<MacroProfile>) {
  const macroProfile = enforceDbReady(newMacroProfile)
  const { data, error } = await supabase
    .from(TABLE)
    .insert(macroProfile)
    .select()

  if (error !== null) {
    console.error(error)
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
    .from(TABLE)
    .update(macroProfile)
    .eq('id', profileId)
    .select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  return macroProfileSchema.parse(data?.[0])
}

async function deleteMacroProfile(id: MacroProfile['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error !== null) {
    console.error(error)
    throw error
  }
}
