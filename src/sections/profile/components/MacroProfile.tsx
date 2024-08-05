import { Show } from 'solid-js'
import { latestWeight } from '~/legacy/utils/weightUtils'
import { userMacroProfiles } from '~/modules/diet/macro-profile/application/macroProfile'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'
import { userWeights } from '~/modules/weight/application/weight'
import { MacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'

// TODO: Rename MacroProfileComp to MacroProfile
export function MacroProfileComp() {
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
            weight={() => weight.weight}
            profiles={userMacroProfiles}
            mode="edit"
          />
        )}
      </Show>
    </div>
  )
}
