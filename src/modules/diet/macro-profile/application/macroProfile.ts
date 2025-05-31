import { getLatestMacroProfile } from '~/legacy/utils/macroProfileUtils'
import { type MacroProfile, type NewMacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'
import {
  createSupabaseMacroProfileRepository,
  SUPABASE_TABLE_MACRO_PROFILES,
} from '~/modules/diet/macro-profile/infrastructure/supabaseMacroProfileRepository'
import { currentUserId } from '~/modules/user/application/user'
import { createEffect, createSignal } from 'solid-js'
import toast from 'solid-toast'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'

const macroProfileRepository = createSupabaseMacroProfileRepository()

export const [userMacroProfiles, setUserMacroProfiles] = createSignal<
  readonly MacroProfile[]
>([])

export const latestMacroProfile = () =>
  getLatestMacroProfile(userMacroProfiles())

async function bootstrap() {
  await toast.promise(fetchUserMacroProfiles(currentUserId()), {
    loading: 'Carregando perfis de macro...',
    success: 'Perfis de macro carregados com sucesso',
    error: 'Falha ao carregar perfis de macro',
  })
}

/**
 * Every time the user changes, fetch all user macro profiles
 */
createEffect(() => {
  bootstrap()
})

/**
 * When a realtime event occurs, fetch all user macro profiles again
 */
registerSubapabaseRealtimeCallback(SUPABASE_TABLE_MACRO_PROFILES, () => {
  bootstrap()
})

export async function fetchUserMacroProfiles(userId: number) {
  const macroProfiles =
    await macroProfileRepository.fetchUserMacroProfiles(userId)
  setUserMacroProfiles(macroProfiles)
  return macroProfiles
}

export async function insertMacroProfile(
  newMacroProfile: NewMacroProfile,
) {
  const macroProfile = await toast.promise(
    macroProfileRepository.insertMacroProfile(newMacroProfile),
    {
      loading: 'Criando perfil de macro...',
      success: 'Perfil de macro criado com sucesso',
      error: 'Falha ao criar perfil de macro',
    },
  )

  if (macroProfile && (
    userMacroProfiles().length === 0 ||
    macroProfile.owner === userMacroProfiles()[0].owner
  )) {
    await fetchUserMacroProfiles(macroProfile.owner)
  }
  return macroProfile
}

export async function updateMacroProfile(
  macroProfileId: MacroProfile['id'],
  newMacroProfile: NewMacroProfile,
) {
  const macroProfiles = await toast.promise(
    macroProfileRepository.updateMacroProfile(macroProfileId, newMacroProfile),
    {
      loading: 'Atualizando perfil de macro...',
      success: 'Perfil de macro atualizado com sucesso',
      error: 'Falha ao atualizar perfil de macro',
    },
  )
  if (macroProfiles && macroProfiles.owner === userMacroProfiles()[0].owner) {
    await fetchUserMacroProfiles(macroProfiles.owner)
  }
  return macroProfiles
}

export async function deleteMacroProfile(macroProfileId: MacroProfile['id']) {
  await toast.promise(
    macroProfileRepository.deleteMacroProfile(macroProfileId),
    {
      loading: 'Deletando perfil de macro...',
      success: 'Perfil de macro deletado com sucesso',
      error: 'Falha ao deletar perfil de macro',
    },
  )
  if (userMacroProfiles().length > 0) {
    await fetchUserMacroProfiles(userMacroProfiles()[0].owner)
  }
}
