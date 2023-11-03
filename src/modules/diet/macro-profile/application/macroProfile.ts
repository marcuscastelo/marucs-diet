import { getLatestMacroProfile } from '@/legacy/utils/macroProfileUtils'
import { type DbReady } from '@/legacy/utils/newDbRecord'
import { type MacroProfile } from '@/modules/diet/macro-profile/domain/macroProfile'
import { createSupabaseMacroProfileRepository } from '@/modules/diet/macro-profile/infrastructure/supabaseMacroProfileRepository'
import { currentUserId } from '@/modules/user/application/user'
import { createEffect, createSignal } from 'solid-js'

const macroProfileRepository = createSupabaseMacroProfileRepository()

export const [userMacroProfiles, setUserMacroProfiles] = createSignal<readonly MacroProfile[]>([])
export const latestMacroProfile = () => getLatestMacroProfile(userMacroProfiles())

createEffect(() => {
  fetchUserMacroProfiles(currentUserId()).catch(() => {
    console.error('Failed to fetch user macro profiles')
  })
})

export async function fetchUserMacroProfiles (userId: number) {
  const macroProfiles = await macroProfileRepository.fetchUserMacroProfiles(userId)
  setUserMacroProfiles(macroProfiles)
  return macroProfiles
}

export async function insertMacroProfile (newMacroProfile: DbReady<MacroProfile>) {
  const macroProfile = await macroProfileRepository.insertMacroProfile(newMacroProfile)
  if (macroProfile.owner === userMacroProfiles()[0].owner) {
    await fetchUserMacroProfiles(macroProfile.owner)
  }
  return macroProfile
}

export async function updateMacroProfile (macroProfileId: MacroProfile['id'], newMacroProfile: MacroProfile) {
  const macroProfiles = await macroProfileRepository.updateMacroProfile(macroProfileId, newMacroProfile)
  if (macroProfiles.owner === userMacroProfiles()[0].owner) {
    await fetchUserMacroProfiles(macroProfiles.owner)
  }
  return macroProfiles
}

export async function deleteMacroProfile (macroProfileId: MacroProfile['id']) {
  await macroProfileRepository.deleteMacroProfile(macroProfileId)
  if (userMacroProfiles().length > 0) {
    await fetchUserMacroProfiles(userMacroProfiles()[0].owner)
  }
}
