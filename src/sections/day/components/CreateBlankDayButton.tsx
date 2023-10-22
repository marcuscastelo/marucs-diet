'use client'

import { useUserContext } from '@/sections/user/context/UserContext'
import { createDay } from '@/modules/diet/day/domain/day'
import { useDayContext } from '@/src/sections/day/context/DaysContext'

export default function CreateBlankDayButton({
  selectedDay,
}: {
  selectedDay: string
}) {
  const { user } = useUserContext()
  const { insertDay } = useDayContext()

  return (
    <button
      className="btn-primary btn mt-3 min-w-full rounded px-4 py-2 font-bold text-white"
      onClick={() => {
        insertDay(createDay({ owner: user.id, target_day: selectedDay }))
      }}
    >
      Criar dia do zero
    </button>
  )
}
