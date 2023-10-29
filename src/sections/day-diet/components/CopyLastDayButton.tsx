'use client'

import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { ReadonlySignal } from '@preact/signals-react'
import {
  dayDiets,
  insertDayDiet,
  updateDayDiet,
} from '@/src/modules/diet/day-diet/application/dayDiet'

export default function CopyLastDayButton({
  day,
  selectedDay,
}: {
  day: ReadonlySignal<DayDiet | undefined>
  selectedDay: string
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  if (dayDiets.value === undefined) {
    console.error('days is undefined')
    return <></>
  }

  // TODO: Create signal for last day instead of fetching all days
  const lastDay = dayDiets.value.findLast(
    (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
  )
  if (lastDay === undefined) {
    return (
      <button
        className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={
          () =>
            alert(`Não foi possível encontrar um dia anterior a ${selectedDay}`) // TODO: Change all alerts with ConfirmModal
        }
      >
        Copiar dia anterior: não encontrado!
      </button>
    )
  }

  return (
    <button
      className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
      onClick={async () => {
        const dayValue = day.value
        if (dayValue !== undefined) {
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
                onClick: async () => {
                  updateDayDiet(dayValue.id, {
                    ...lastDay,
                    target_day: selectedDay,
                  })
                },
              },
            ],
          })
          return
        }

        insertDayDiet({
          ...lastDay,
          target_day: selectedDay,
        })
      }}
    >
      {/* //TODO: retriggered: copiar qualquer dia */}
      Copiar dia anterior ({lastDay.target_day})
    </button>
  )
}
