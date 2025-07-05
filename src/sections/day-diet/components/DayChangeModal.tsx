import { Button } from '~/sections/common/components/buttons/Button'
import { dateToDDMM } from '~/shared/utils/date/dateUtils'

type DayChangeModalProps = {
  previousDay: string
  newDay: string
  onGoToToday: () => void
  onStayOnDay: () => void
}

export function DayChangeModal(props: DayChangeModalProps) {
  const previousDate = new Date(props.previousDay)
  const formattedPreviousDay = dateToDDMM(previousDate)

  return (
    <div class="flex flex-col gap-4">
      <h2 class="text-lg font-bold">Dia alterado</h2>
      <p class="text-gray-300">
        O dia mudou. Deseja ir para hoje ou continuar visualizando{' '}
        <span class="font-medium text-white">{formattedPreviousDay}</span>?
      </p>
      <div class="flex gap-3 mt-4">
        <Button
          type="button"
          color="primary"
          onClick={props.onGoToToday}
          class="flex-1"
        >
          Ir para hoje
        </Button>
        <Button
          type="button"
          color="secondary"
          onClick={props.onStayOnDay}
          class="flex-1"
        >
          Continuar em {formattedPreviousDay}
        </Button>
      </div>
    </div>
  )
}
