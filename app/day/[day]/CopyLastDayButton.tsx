'use client'

import { useConfirmModalContext } from '@/context/confirmModal.context'
import { updateDay, upsertDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'

export default function CopyLastDayButton({
  days,
  day,
  selectedDay,
  refetchDays,
}: {
  days: Day[]
  day: Day | undefined
  selectedDay: string
  refetchDays: () => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  if (days === undefined) {
    console.error('days is undefined')
    return <></>
  }

  const lastDay = days.findLast(
    (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
  )
  if (lastDay === undefined) {
    return (
      <button
        className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
        onClick={() =>
          alert(`Não foi possível encontrar um dia anterior a ${selectedDay}`)
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
        if (day !== undefined) {
          showConfirmModal({
            title: 'Sobrescrever dia',
            message: 'Tem certeza que deseja SOBRESCREVER este dia?',
            actions: [
              {
                text: 'Cancelar',
                onClick: () => undefined,
              },
              {
                text: 'Sobrescrever',
                primary: true,
                onClick: async () => {
                  updateDay(day?.id, {
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
