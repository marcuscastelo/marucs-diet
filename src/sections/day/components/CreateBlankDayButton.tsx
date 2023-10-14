'use client'

import { useUserContext } from '@/sections/user/context/UserContext'
import { upsertDay } from '@/controllers/days'
import { createDay } from '@/src/model/dayModel'

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
        upsertDay(createDay({ owner: user.id, target_day: selectedDay })).then(
          () => {
            refetchDays()
          },
        )
      }}
    >
      Criar dia do zero
    </button>
  )
}
