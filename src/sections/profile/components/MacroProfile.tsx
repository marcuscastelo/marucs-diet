import { Show } from 'solid-js'
import toast from 'solid-toast'
import { getTodayYYYMMDD } from '~/legacy/utils/dateUtils'
import { latestWeight } from '~/legacy/utils/weightUtils'
import {
  insertMacroProfile,
  updateMacroProfile,
  userMacroProfiles,
} from '~/modules/diet/macro-profile/application/macroProfile'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { userWeights } from '~/modules/weight/application/weight'
import { MacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'

// TODO: Rename to MacroProfile
export function MacroProfileComp() {
  const onSaveProfile = async (profile: MacroProfile) => {
    console.log('[ProfilePage] Saving profile', profile)
    if (profile.target_day.getTime() > new Date(getTodayYYYMMDD()).getTime()) {
      console.error(
        `[ProfilePage] Invalid target day ${profile.target_day.toString()}: it is in the future`,
      )
      toast.error('Data alvo não pode ser no futuro')
    } else if (
      profile.id !== -1 && // TODO: Better typing system for new MacroProfile instead of -1
      profile.target_day.getTime() === new Date(getTodayYYYMMDD()).getTime()
    ) {
      console.log('[ProfilePage] Updating profile', profile)

      // Same day, update
      await updateMacroProfile(profile.id, profile)
    } else if (
      profile.id === -1 || // TODO: Better typing system for new MacroProfile instead of -1
      profile.target_day.getTime() < new Date(getTodayYYYMMDD()).getTime()
    ) {
      console.log('[ProfilePage] Inserting profile', profile)

      // Past day, insert with new date
      await insertMacroProfile({
        ...profile,
        target_day: new Date(getTodayYYYMMDD()),
      })
    } else {
      toast.error('Erro imprevisto ao salvar perfil de macro')
    }
  }

  return (
    <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <Show
        // TODO: latestWeight should be a signal
        when={latestWeight(userWeights())}
        fallback={
          <h1>Não há pesos registrados, o perfil não pode ser calculado</h1>
        }
        keyed
      >
        {(weight) => (
          <MacroTarget
            weight={weight.weight}
            profiles={userMacroProfiles}
            onSaveMacroProfile={(profile) => {
              onSaveProfile(profile).catch((error) => {
                console.error(error)
              })
            }}
            mode="edit"
          />
        )}
      </Show>
    </div>
  )
}
