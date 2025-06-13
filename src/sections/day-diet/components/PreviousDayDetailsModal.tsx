import { type Setter, Show } from 'solid-js'

import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'

type PreviousDayDetailsModalProps = {
  visible: boolean
  setVisible: Setter<boolean>
  dayDiet: DayDiet
}

function PreviousDayDetailsModal(props: PreviousDayDetailsModalProps) {
  return (
    <Show when={props.visible}>
      <ModalContextProvider
        visible={() => props.visible}
        setVisible={props.setVisible}
      >
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
              onClick={() => props.setVisible(false)}
            >
              Fechar
            </button>
          </div>
        </Modal>
      </ModalContextProvider>
    </Show>
  )
}

export default PreviousDayDetailsModal
