'use client'

import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { Day } from '@/modules/diet/day/domain/day'
import { ReadonlySignal, computed } from '@preact/signals-react'
import { useDayContext } from '@/src/sections/day/context/DaysContext'

export default function CopyLastDayButton({
  day,
  selectedDay,
}: {
  day: ReadonlySignal<Day | undefined>
  selectedDay: string
}) {
  const { show: showConfirmModal } = useConfirmModalContext()
  const { days, insertDay, updateDay } = useDayContext()

  if (days.value.loading || days.value.errored) {
    return <></>
  }

  if (days.value === undefined) {
    console.error('days is undefined')
    return <></>
  }

  const lastDay = days.value.data.findLast(
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
                  updateDay(dayValue.id, {
                    ...lastDay,
                    target_day: selectedDay,
                  })
                },
              },
            ],
          })
          return
        }

        insertDay({
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
