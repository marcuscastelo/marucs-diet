import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { createNewDayDiet, type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  dayDiets,
  insertDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { Show, createEffect, createSignal, type Accessor } from 'solid-js'
import toast from 'solid-toast'

export function CopyLastDayButton(props: {
  dayDiet: Accessor<DayDiet | undefined> // TODO: Rename all 'day' to 'dayDiet' on entire project.
  selectedDay: string
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  const [lastDay, setLastDay] = createSignal<DayDiet | undefined>(undefined)

  createEffect(() => {
    const days = [...dayDiets()]
    const newLastDay = days
      .reverse()
      .find((day) => Date.parse(day.targetDay) < Date.parse(props.selectedDay))
    setLastDay(newLastDay)
  })

  return (
    <>
      <Show
        when={lastDay()}
        keyed
        fallback={
          <>
            <button
              class="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
              onClick={() => {
                toast.error(
                  `Não foi possível encontrar um dia anterior a ${props.selectedDay}`,
                )
              }}
            >
              Copiar dia anterior: não encontrado! :(
            </button>
          </>
        }
      >
        {(lastDay) => (
          <button
            class="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
            onClick={() => {
              const day_ = props.dayDiet()
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
                        updateDayDiet(day_.id, createNewDayDiet({
                          ...lastDay,
                          target_day: props.selectedDay,
                        }))
                      },
                    },
                  ],
                })
                return
              }

              insertDayDiet(createNewDayDiet({
                ...lastDay,
                target_day: props.selectedDay,
              }))
            }}
          >
            {/* //TODO: Allow copying any past day, not just latest one. */}
            Copiar dia anterior ({lastDay.targetDay})
          </button>
        )}
      </Show>
    </>
  )
}
