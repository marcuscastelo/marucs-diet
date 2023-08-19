'use client'

import { mockDay } from '@/app/test/unit/(mock)/mockData'
import { useUserContext } from '@/context/users.context'
import { upsertDay } from '@/controllers/days'

export default function CreateBlankDayButton({
  selectedDay,
  refetchDays,
}: {
  selectedDay: string
  refetchDays: () => void
}) {
  const { user } = useUserContext()

  return (
    <button
      className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
      onClick={() => {
        upsertDay(
          mockDay({ owner: user.id, target_day: selectedDay }, { groups: [] }),
        ).then(() => {
          refetchDays()
        })
      }}
    >
      Criar dia do zero
    </button>
  )
}
