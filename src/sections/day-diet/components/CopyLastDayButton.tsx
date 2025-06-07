import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { Modal } from '~/sections/common/components/Modal'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { createSignal, type Accessor, Show } from 'solid-js'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  getPreviousDayDiets,
  insertDayDiet,
  updateDayDiet,
  dayDiets,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  showError,
  showSuccess,
} from '~/modules/toast/application/toastManager'

import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'

export function CopyLastDayButton(props: {
  dayDiet: Accessor<DayDiet | undefined>
  selectedDay: string
}) {
  // Estado do modal
  const [modalOpen, setModalOpen] = createSignal(false)
  // Estado para data selecionada no datepicker
  const [selectedCopyDay, setSelectedCopyDay] = createSignal<string | null>(
    null,
  )

  const previousDays = () => getPreviousDayDiets(dayDiets(), props.selectedDay)
  const selectedDayDiet = () =>
    previousDays().find((d) => d.target_day === selectedCopyDay())

  return (
    <>
      {/* Botão para abrir modal de cópia */}
      <button
        class="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={() => setModalOpen(true)}
      >
        Copiar dia anterior
      </button>
      {/* Modal de seleção de dia anterior */}
      <ModalContextProvider visible={modalOpen} setVisible={setModalOpen}>
        <Modal>
          <div class="flex flex-col gap-4 min-h-[500px]">
            <h2 class="text-lg font-bold">
              Selecione um dia anterior para copiar
            </h2>
            <Datepicker
              asSingle={true}
              useRange={false}
              displayFormat="YYYY-MM-DD"
              value={{
                startDate: selectedCopyDay(),
                endDate: selectedCopyDay(),
              }}
              onChange={(v) => {
                let val = v?.startDate ?? null
                if (val instanceof Date) {
                  val = val.toISOString().slice(0, 10)
                }
                setSelectedCopyDay(val)
              }}
              maxDate={new Date(props.selectedDay)}
            />
            <Show when={selectedDayDiet()}>
              <div class="border-t pt-4 mt-2">
                <h3 class="font-semibold mb-2">Resumo do dia selecionado</h3>
                <DayMacros dayDiet={selectedDayDiet()} />
                <DayMeals
                  dayDiet={selectedDayDiet()}
                  selectedDay={selectedDayDiet()?.target_day ?? ''}
                  mode="summary"
                />
              </div>
            </Show>
            {/* Botão de confirmação/cópia */}
            <button
              class="btn-primary btn mt-4 w-full"
              disabled={!selectedDayDiet()}
              onClick={() => {
                if (!selectedDayDiet()) return
                void (async () => {
                  const copyFrom = selectedDayDiet()!
                  const allDays = dayDiets()
                  const existing = allDays.find(
                    (d) => d.target_day === props.selectedDay,
                  )
                  const newDay = {
                    target_day: props.selectedDay,
                    owner: copyFrom.owner,
                    meals: copyFrom.meals,
                    __type: 'NewDayDiet' as const,
                  }
                  try {
                    if (existing) {
                      await updateDayDiet(existing.id, newDay)
                    } else {
                      await insertDayDiet(newDay)
                    }
                    setModalOpen(false)
                    showSuccess('Dia copiado com sucesso!', {
                      context: 'user-action',
                    })
                  } catch (e) {
                    showError(
                      e,
                      { context: 'user-action' },
                      'Erro ao copiar dia',
                    )
                  }
                })()
              }}
            >
              Copiar para {props.selectedDay}
            </button>
          </div>
        </Modal>
      </ModalContextProvider>
    </>
  )
}
