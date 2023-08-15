'use client'

import { deleteDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'

export default function DeleteDayButton({
  dayData,
  refetchDays,
}: {
  dayData: Day | null | undefined
  refetchDays: () => void
}) {
  return (
    <button
      className="btn-error btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white hover:bg-red-400"
      onClick={async () => {
        if (!confirm('Tem certeza que deseja excluir este dia?')) {
          return
        }
        // TODO: Avoid non-null assertion
        await deleteDay(dayData!.id)
        refetchDays()
      }}
    >
      PERIGO: Excluir dia
    </button>
  )
}
