'use client'

import { useConfirmModalContext } from '@/context/confirmModal.context'
import { deleteDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'

export default function DeleteDayButton({
  dayData,
  refetchDays,
}: {
  dayData: Day | null | undefined
  refetchDays: () => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <button
      className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white hover:bg-red-400"
      onClick={() => {
        showConfirmModal({
          title: 'Excluir dia',
          message: 'Tem certeza que deseja excluir este dia?',
          onConfirm: async () => {
            if (dayData) {
              await deleteDay(dayData.id)
              refetchDays()
            } else {
              console.error('Day data is null')
              throw new Error('Day data is null')
            }
          },
        })
      }}
    >
      PERIGO: Excluir dia
    </button>
  )
}
