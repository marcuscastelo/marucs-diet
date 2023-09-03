'use client'

import { useConfirmModalContext } from '@/context/confirmModal.context'
import { deleteDay, updateDay, upsertDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { Loaded } from '@/utils/loadable'

export default function CopyLastDayButton({
  days,
  day,
  selectedDay,
  refetchDays,
}: {
  days: Loaded<Day[]>
  day: Day | undefined
  selectedDay: string
  refetchDays: () => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  const lastDayIdx = days.data.findLastIndex(
    (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
  )
  if (lastDayIdx === -1) {
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
            onConfirm: async () => {
              updateDay(day?.id, {
                ...days.data[lastDayIdx],
                target_day: selectedDay,
              }).then(() => {
                refetchDays()
              })
            },
          })
          return
        }

        upsertDay({
          ...days.data[lastDayIdx],
          target_day: selectedDay,
        }).then(() => {
          refetchDays()
        })
      }}
    >
      {/* //TODO: retriggered: copiar qualquer dia */}
      Copiar dia anterior ({days.data[lastDayIdx].target_day})
    </button>
  )
}
