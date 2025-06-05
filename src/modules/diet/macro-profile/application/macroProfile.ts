import { getLatestMacroProfile } from '~/legacy/utils/macroProfileUtils'
import {
  type MacroProfile,
  type NewMacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import {
  createSupabaseMacroProfileRepository,
  SUPABASE_TABLE_MACRO_PROFILES,
} from '~/modules/diet/macro-profile/infrastructure/supabaseMacroProfileRepository'
import { currentUserId } from '~/modules/user/application/user'
import { createEffect, createSignal } from 'solid-js'
import { smartToastPromise, smartToastPromiseDetached } from '~/shared/toast'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'
import { handleApiError } from '~/shared/error/errorHandler'

const macroProfileRepository = createSupabaseMacroProfileRepository()

export const [userMacroProfiles, setUserMacroProfiles] = createSignal<
  readonly MacroProfile[]
>([])

export const latestMacroProfile = () =>
  getLatestMacroProfile(userMacroProfiles())

function bootstrap() {
  smartToastPromiseDetached(fetchUserMacroProfiles(currentUserId()), {
    context: 'background',
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
    const macroProfile = await smartToastPromise(
      macroProfileRepository.insertMacroProfile(newMacroProfile),
      {
        context: 'user-action',
        loading: 'Criando perfil de macro...',
        success: 'Perfil de macro criado com sucesso',
        error: 'Falha ao criar perfil de macro',
      },
    )

    if (
      macroProfile !== null &&
      macroProfile !== undefined &&
      (userMacroProfiles().length === 0 ||
        macroProfile.owner === userMacroProfiles()[0].owner)
    ) {
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
    const macroProfiles = await smartToastPromise(
      macroProfileRepository.updateMacroProfile(
        macroProfileId,
        newMacroProfile,
      ),
      {
        context: 'user-action',
        loading: 'Atualizando perfil de macro...',
        success: 'Perfil de macro atualizado com sucesso',
        error: 'Falha ao atualizar perfil de macro',
      },
    )
    const firstUserMacroProfile = userMacroProfiles()[0]
    if (
      macroProfiles !== null &&
      macroProfiles !== undefined &&
      firstUserMacroProfile !== undefined &&
      macroProfiles.owner === firstUserMacroProfile.owner
    ) {
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

export async function deleteMacroProfile(macroProfileId: MacroProfile['id']) {
  try {
    await smartToastPromise(
      macroProfileRepository.deleteMacroProfile(macroProfileId),
      {
        context: 'user-action',
        loading: 'Deletando perfil de macro...',
        success: 'Perfil de macro deletado com sucesso',
        error: 'Falha ao deletar perfil de macro',
      },
    )
    if (userMacroProfiles().length > 0) {
      await fetchUserMacroProfiles(userMacroProfiles()[0].owner)
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
