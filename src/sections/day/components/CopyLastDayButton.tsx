'use client'

import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { updateDay, upsertDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { ReadonlySignal } from '@preact/signals-react'

export default function CopyLastDayButton({
  days,
  day,
  selectedDay,
  refetchDays,
}: {
  days: ReadonlySignal<Day[]>
  day: ReadonlySignal<Day | undefined>
  selectedDay: string
  refetchDays: () => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  if (days.value === undefined) {
    console.error('days is undefined')
    return <></>
  }

  const lastDay = days.value.findLast(
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
                  }).then(() => {
                    refetchDays()
                  })
                },
              },
            ],
          })
          return
        }

        upsertDay({
          ...lastDay,
          target_day: selectedDay,
        }).then(() => {
          refetchDays()
        })
      }}
    >
      {/* //TODO: retriggered: copiar qualquer dia */}
      Copiar dia anterior ({lastDay.target_day})
    </button>
  )
}
