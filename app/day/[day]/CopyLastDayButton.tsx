'use client'

import { useConfirmModalContext } from '@/context/confirmModal.context'
import { deleteDay, upsertDay } from '@/controllers/days'
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
            title: 'Excluir dia',
            message: 'Tem certeza que deseja excluir este dia?',
            onConfirm: async () => {
              await deleteDay(day.id)
            },
          })
        }

        upsertDay({
          ...lastDay,
          target_day: selectedDay,
          id: day?.id,
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
