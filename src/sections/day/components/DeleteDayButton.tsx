'use client'

import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { Day } from '@/modules/day/domain/day'
import { ReadonlySignal } from '@preact/signals-react'
import { useDayContext } from '@/src/sections/day/context/DaysContext'

export default function DeleteDayButton({
  day,
}: {
  day: ReadonlySignal<Day | null | undefined>
}) {
  const { show: showConfirmModal } = useConfirmModalContext()
  const { deleteDay } = useDayContext()

  return (
    <button
      className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white hover:bg-red-400"
      onClick={() => {
        showConfirmModal({
          title: 'Excluir dia',
          body: 'Tem certeza que deseja excluir este dia?',
          actions: [
            {
              text: 'Cancelar',
              onClick: () => undefined,
            },
            {
              text: 'Excluir dia',
              primary: true,
              onClick: async () => {
                if (day.value) {
                  deleteDay(day.value.id)
                } else {
                  console.error('Day is null')
                  throw new Error('Day is null')
                }
              },
            },
          ],
        })
      }}
    >
      PERIGO: Excluir dia
    </button>
  )
}
