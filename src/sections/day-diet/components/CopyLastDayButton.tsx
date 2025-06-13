import { format } from 'date-fns'
import { type Accessor, createSignal, For, Show } from 'solid-js'

import {
  dayDiets,
  getPreviousDayDiets,
  insertDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  showError,
  showSuccess,
} from '~/modules/toast/application/toastManager'
import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import DayMeals from '~/sections/day-diet/components/DayMeals'

export function CopyLastDayButton(props: {
  dayDiet: Accessor<DayDiet | undefined>
  selectedDay: string
}) {
  // Modal state
  const [modalOpen, setModalOpen] = createSignal(false)

  const previousDays = () => getPreviousDayDiets(dayDiets(), props.selectedDay)
  // Remove selectedCopyDay and selectedDayDiet state, use local state for copying
  const [copyingDay, setCopyingDay] = createSignal<string | null>(null)
  const [copying, setCopying] = createSignal(false)

  async function handleCopy(day: string) {
    setCopyingDay(day)
    setCopying(true)
    const copyFrom = previousDays().find((d) => d.target_day === day)
    if (!copyFrom) {
      setCopying(false)
      return
    }
    const allDays = dayDiets()
    const existing = allDays.find((d) => d.target_day === props.selectedDay)
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
      showSuccess('Dia copiado com sucesso!', { context: 'user-action' })
    } catch (e) {
      showError(e, { context: 'user-action' }, 'Erro ao copiar dia')
    } finally {
      setCopying(false)
      setCopyingDay(null)
    }
  }

  return (
    <>
      {/* Button to open copy modal */}
      <button
        class="btn-primary btn cursor-pointer uppercase mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={() => setModalOpen(true)}
      >
        Copiar dia anterior
      </button>
      {/* Modal for selecting previous day to copy */}
      <ModalContextProvider visible={modalOpen} setVisible={setModalOpen}>
        <Modal>
          <div class="flex flex-col gap-4 min-h-[500px]">
            <h2 class="text-lg font-bold">
              Selecione um dia anterior para copiar
            </h2>
            <Show
              when={previousDays().length > 0}
              fallback={
                <div class="text-gray-500">
                  Nenhum dia com dieta registrada disponível para copiar.
                </div>
              }
            >
              <div class="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {/* TODO: Implement scrollbar for big lists instead of slice */}
                <For each={previousDays().slice(0, 10)}>
                  {(dayDiet) => {
                    const [showDetails, setShowDetails] = createSignal(false)
                    return (
                      <div class="border rounded p-3 flex flex-col gap-2">
                        <div class="font-semibold">
                          {format(new Date(dayDiet.target_day), 'dd/MM/yyyy')}
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
                              copying() && copyingDay() === dayDiet.target_day
                            }
                            onClick={() => {
                              void handleCopy(dayDiet.target_day)
                            }}
                          >
                            {copying() && copyingDay() === dayDiet.target_day
                              ? 'Copiando...'
                              : `Copiar para Hoje`}
                          </button>
                        </div>
                        <Show when={showDetails()}>
                          <ModalContextProvider
                            visible={showDetails}
                            setVisible={setShowDetails}
                          >
                            <Modal>
                              <div class="flex flex-col gap-4">
                                <h3 class="text-lg font-bold mb-2">
                                  Resumo do dia
                                </h3>
                                <DayMacros dayDiet={dayDiet} />
                                <DayMeals
                                  dayDiet={dayDiet}
                                  selectedDay={dayDiet.target_day}
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
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Modal>
      </ModalContextProvider>
    </>
  )
}
