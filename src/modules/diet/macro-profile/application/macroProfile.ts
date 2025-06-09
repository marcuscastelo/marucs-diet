import { createEffect, createSignal } from 'solid-js'

import { getLatestMacroProfile } from '~/legacy/utils/macroProfileUtils'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'
import {
  type MacroProfile,
  type NewMacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import {
  createSupabaseMacroProfileRepository,
  SUPABASE_TABLE_MACRO_PROFILES,
} from '~/modules/diet/macro-profile/infrastructure/supabaseMacroProfileRepository'
import { showPromise } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { handleApiError } from '~/shared/error/errorHandler'

const macroProfileRepository = createSupabaseMacroProfileRepository()

export const [userMacroProfiles, setUserMacroProfiles] = createSignal<
  readonly MacroProfile[]
>([])

export const latestMacroProfile = () =>
  getLatestMacroProfile(userMacroProfiles())

function bootstrap() {
  void showPromise(
    fetchUserMacroProfiles(currentUserId()),
    {
      loading: 'Carregando perfis de macro...',
      success: 'Perfis de macro carregados com sucesso',
      error: 'Falha ao carregar perfis de macro',
    },
    {
      context: 'background',
    },
  )
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
  try {
    const macroProfiles =
      await macroProfileRepository.fetchUserMacroProfiles(userId)
    setUserMacroProfiles(macroProfiles)
    return macroProfiles
  } catch (error) {
    handleApiError(error, {
      component: 'macroProfileApplication',
      operation: 'fetchUserMacroProfiles',
      additionalData: { userId },
    })
    throw error
  }
}

export async function insertMacroProfile(newMacroProfile: NewMacroProfile) {
  try {
    const macroProfile = await showPromise(
      macroProfileRepository.insertMacroProfile(newMacroProfile),
      {
        loading: 'Criando perfil de macro...',
        success: 'Perfil de macro criado com sucesso',
        error: 'Falha ao criar perfil de macro',
      },
    )
    const userProfiles = userMacroProfiles()
    const hasResult = macroProfile !== null
    const hasNoProfiles = userProfiles.length === 0
    const firstProfile = userProfiles[0]
    const isSameOwner =
      !hasNoProfiles &&
      macroProfile !== null &&
      firstProfile !== undefined &&
      macroProfile.owner === firstProfile.owner

    if (hasResult && (hasNoProfiles || isSameOwner)) {
      await fetchUserMacroProfiles(macroProfile.owner)
    }
    return macroProfile
  } catch (error) {
    handleApiError(error, {
      component: 'macroProfileApplication',
      operation: 'insertMacroProfile',
      additionalData: { newMacroProfile },
    })
    throw error
  }
}

export async function updateMacroProfile(
  macroProfileId: MacroProfile['id'],
  newMacroProfile: NewMacroProfile,
) {
  try {
    const macroProfiles = await showPromise(
      macroProfileRepository.updateMacroProfile(
        macroProfileId,
        newMacroProfile,
      ),
      {
        loading: 'Atualizando perfil de macro...',
        success: 'Perfil de macro atualizado com sucesso',
        error: 'Falha ao atualizar perfil de macro',
      },
    )
    const firstUserMacroProfile = userMacroProfiles()[0]
    const hasResult = macroProfiles !== null
    const hasFirstProfile = firstUserMacroProfile !== undefined
    const isSameOwner =
      hasResult &&
      hasFirstProfile &&
      macroProfiles.owner === firstUserMacroProfile.owner

    if (isSameOwner) {
      await fetchUserMacroProfiles(macroProfiles.owner)
    }

    return macroProfiles
  } catch (error) {
    handleApiError(error, {
      component: 'macroProfileApplication',
      operation: 'updateMacroProfile',
      additionalData: { macroProfileId, newMacroProfile },
    })
    throw error
  }
}

export async function deleteMacroProfile(macroProfileId: number) {
  try {
    await showPromise(
      macroProfileRepository.deleteMacroProfile(macroProfileId),
      {
        loading: 'Deletando perfil de macro...',
        success: 'Perfil de macro deletado com sucesso',
        error: 'Falha ao deletar perfil de macro',
      },
    )
    const [first] = userMacroProfiles()
    if (first) {
      await fetchUserMacroProfiles(first.owner)
    }
  } catch (error) {
    handleApiError(error, {
      component: 'macroProfileApplication',
      operation: 'deleteMacroProfile',
      additionalData: { macroProfileId },
    })
    throw error
  }
}
