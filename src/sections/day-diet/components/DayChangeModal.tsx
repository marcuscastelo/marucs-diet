import { Button } from '~/sections/common/components/buttons/Button'
import { closeModal } from '~/shared/modal/helpers/modalHelpers'
import { dateToDDMM } from '~/shared/utils/date/dateUtils'

type DayChangeModalProps = {
  modalId: string
  previousDay: string
  newDay: string
  onGoToToday: () => void
  onStayOnDay: () => void
}

export function DayChangeModal(props: DayChangeModalProps) {
  const previousDate = () => new Date(props.previousDay)
  const formattedPreviousDay = () => dateToDDMM(previousDate())

  const handleGoToToday = () => {
    props.onGoToToday()
    closeModal(props.modalId)
  }

  const handleStayOnDay = () => {
    props.onStayOnDay()
    closeModal(props.modalId)
  }

  return (
    <div class="flex flex-col gap-4">
      <h2 class="text-lg font-bold">Dia alterado</h2>
      <p class="text-gray-300">
        O dia mudou. Deseja ir para hoje ou continuar visualizando{' '}
        <span class="font-medium text-white">{formattedPreviousDay()}</span>?
      </p>
      <div class="flex gap-3 mt-4">
        <Button
          type="button"
          color="primary"
          onClick={handleGoToToday}
          class="flex-1"
        >
          Ir para hoje ({dateToDDMM(new Date())})
        </Button>
        <Button
          type="button"
          color="secondary"
          onClick={handleStayOnDay}
          class="flex-1"
        >
          Continuar em {formattedPreviousDay()}
        </Button>
      </div>
    </div>
  )
}
