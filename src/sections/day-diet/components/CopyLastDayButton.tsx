import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import {
  dayDiets,
  insertDayDiet,
  updateDayDiet,
} from '@/modules/diet/day-diet/application/dayDiet'
import { Show, type Accessor } from 'solid-js'

export function CopyLastDayButton(props: {
  day: Accessor<DayDiet | undefined> // TODO: Rename all 'day' to 'dayDiet' on entire project
  selectedDay: string
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  // TODO: Create signal for last day instead of fetching all days
  const lastDay = () =>
    [...dayDiets()]
      .reverse()
      .find((day) => Date.parse(day.target_day) < Date.parse(props.selectedDay))
  return (
    <>
      <Show when={lastDay() === undefined}>
        <button
          class="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
          onClick={
            () => {
              alert(
                `Não foi possível encontrar um dia anterior a ${props.selectedDay}`,
              )
            } // TODO: Change all alerts with ConfirmModal
          }
        >
          Copiar dia anterior: não encontrado!
        </button>
      </Show>

      <Show when={lastDay()}>
        {(lastDay) => (
          <button
            class="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
            onClick={() => {
              const day_ = props.day()
              if (day_ !== undefined) {
                showConfirmModal({
                  title: 'Sobrescrever dia',
                  body: 'Tem certeza que deseja SOBRESCREVER este dia?',
                  actions: [
                    {
                      text: 'Cancelar',
                      onClick: () => undefined,
                    },
                    {
                      text: 'Sobrescrever',
                      primary: true,
                      onClick: () => {
                        updateDayDiet(day_.id, {
                          ...lastDay(),
                          target_day: props.selectedDay,
                        })
                      },
                    },
                  ],
                })
                return
              }

              insertDayDiet({
                ...lastDay(),
                target_day: props.selectedDay,
              })
            }}
          >
            {/* //TODO: Allow copying any past day, not just latest one */}
            Copiar dia anterior ({lastDay().target_day})
          </button>
        )}
      </Show>
    </>
  )
}
