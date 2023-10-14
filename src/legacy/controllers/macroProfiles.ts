import {
  MacroProfile,
  macroProfileSchema,
} from '@/modules/macro-profile/domain/macroProfile'
import { User } from '@/modules/user/domain/user'
import { DbReady, enforceDbReady } from '@/legacy/utils/newDbRecord'
import supabase from '@/legacy/utils/supabase'

const TABLE = 'macro_profiles'

export async function fetchUserMacroProfiles(userId: User['id']) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('owner', userId)
    .order('target_day', { ascending: true })

  if (error) {
    console.error(error)
    throw error
  }

  return macroProfileSchema.array().parse(data)
}

export async function insertMacroProfile(
  newMacroProfile: DbReady<MacroProfile>,
) {
  const macroProfile = enforceDbReady(newMacroProfile)
  const { data, error } = await supabase
    .from(TABLE)
    .insert(macroProfile)
    .select()

  if (error) {
    console.error(error)
    throw error
  }

  return macroProfileSchema.parse(data?.[0])
}

export async function updateMacroProfile(
  profileId: MacroProfile['id'],
  newMacroProfile: DbReady<MacroProfile>,
) {
  const macroProfile = enforceDbReady(newMacroProfile)
  const { data, error } = await supabase
    .from(TABLE)
    .update(macroProfile)
    .eq('id', profileId)
    .select()

  if (error) {
    console.error(error)
    throw error
  }

  return macroProfileSchema.parse(data?.[0])
}

export async function deleteMacroProfile(id: MacroProfile['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) {
    console.error(error)
    throw error
  }
}
