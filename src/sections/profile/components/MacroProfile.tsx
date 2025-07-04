import { Show } from 'solid-js'

import { userMacroProfiles } from '~/modules/diet/macro-profile/application/macroProfile'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { MacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'
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
          <MacroTarget
            weight={() => weight().weight}
            profiles={userMacroProfiles}
            mode="edit"
          />
        )}
      </Show>
    </div>
  )
}
