import { type Component } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'

type PreviousDayCardActionsProps = {
  dayDiet: DayDiet
  copying: boolean
  copyingDay: string | null
  onShowDetails: () => void
  onCopy: (day: string) => void
}

const PreviousDayCardActions: Component<PreviousDayCardActionsProps> = (
  props,
) => (
  <div class="flex gap-3">
    <button class="btn-secondary btn flex-1" onClick={props.onShowDetails}>
      Ver dia
    </button>
    <button
      class="btn-primary btn flex-1"
      disabled={props.copying && props.copyingDay === props.dayDiet.target_day}
      onClick={() => props.onCopy(props.dayDiet.target_day)}
    >
      {props.copying && props.copyingDay === props.dayDiet.target_day
        ? 'Copiando...'
        : 'Copiar para Hoje'}
    </button>
  </div>
)

export default PreviousDayCardActions
