'use client'

import { deleteDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { Loaded } from '@/utils/loadable'

export default function DeleteDayButton({
  dayData,
  fetchDays,
  user,
}: {
  dayData: Day | null | undefined
  fetchDays: (userId: User['id']) => Promise<void>
  user: Loaded<User>
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
        await fetchDays(user.data.id)
      }}
    >
      PERIGO: Excluir dia
    </button>
  )
}
