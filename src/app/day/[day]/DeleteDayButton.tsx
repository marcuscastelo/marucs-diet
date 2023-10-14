'use client'

import { useConfirmModalContext } from '@/context/confirmModal.context'
import { deleteDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { ReadonlySignal } from '@preact/signals-react'

export default function DeleteDayButton({
  day,
  refetchDays,
}: {
  day: ReadonlySignal<Day | null | undefined>
  refetchDays: () => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

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
                  await deleteDay(day.value.id)
                  refetchDays()
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
