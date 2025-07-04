import { Show } from 'solid-js'

import {
  latestMacroProfile,
  previousMacroProfile,
  userMacroProfiles,
} from '~/modules/diet/macro-profile/application/macroProfile'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { MacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'
import { getLatestMacroProfile } from '~/shared/utils/macroProfileUtils'
import { latestWeight } from '~/shared/utils/weightUtils'

export function MacroProfileSettings() {
  return (
    <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <Show
        when={latestWeight()}
        fallback={
          <h1>Não há pesos registrados, o perfil não pode ser calculado</h1>
        }
      >
        {(weight) => (
          <Show
            when={latestMacroProfile()}
            fallback={<h1>Não há perfis de macro registrados</h1>}
          >
            {(macroProfile) => (
              <MacroTarget
                weight={() => weight().weight}
                currentProfile={macroProfile}
                previousMacroProfile={previousMacroProfile}
                mode="edit"
              />
            )}
          </Show>
        )}
      </Show>
    </div>
  )
}
