import { format } from 'date-fns'
import { createSignal, Show } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'

type PreviousDayCardProps = {
  dayDiet: DayDiet
  copying: boolean
  copyingDay: string | null
  onCopy: (day: string) => void
}

function PreviousDayCard(props: PreviousDayCardProps) {
  const [showDetails, setShowDetails] = createSignal(false)
  return (
    <div class="border rounded p-3 flex flex-col gap-2">
      <div class="font-semibold">
        {format(new Date(props.dayDiet.target_day), 'dd/MM/yyyy')}
      </div>
      <div class="flex gap-3">
        <button
          class="btn-secondary btn flex-1"
          onClick={() => setShowDetails(true)}
        >
          Ver dia
        </button>
        <button
          class="btn-primary btn flex-1"
          disabled={
            props.copying && props.copyingDay === props.dayDiet.target_day
          }
          onClick={() => props.onCopy(props.dayDiet.target_day)}
        >
          {props.copying && props.copyingDay === props.dayDiet.target_day
            ? 'Copiando...'
            : `Copiar para Hoje`}
        </button>
      </div>
      <Show when={showDetails()}>
        <ModalContextProvider visible={showDetails} setVisible={setShowDetails}>
          <Modal>
            <div class="flex flex-col gap-4">
              <h3 class="text-lg font-bold mb-2">Resumo do dia</h3>
              <DayMacros dayDiet={props.dayDiet} />
              <DayMeals
                dayDiet={props.dayDiet}
                selectedDay={props.dayDiet.target_day}
                mode="summary"
              />
              <button
                class="btn-secondary btn mt-2 w-full"
                onClick={() => setShowDetails(false)}
              >
                Fechar
              </button>
            </div>
          </Modal>
        </ModalContextProvider>
      </Show>
    </div>
  )
}

export default PreviousDayCard
