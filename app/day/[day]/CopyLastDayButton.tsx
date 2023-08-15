'use client'

import { deleteDay, upsertDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { Loaded } from '@/utils/loadable'

export default function CopyLastDayButton({
  days,
  user,
  dayData,
  selectedDay,
  fetchDays,
}: {
  days: Loaded<Day[]>
  user: Loaded<User>
  dayData: Day | null | undefined
  selectedDay: string
  fetchDays: (userId: User['id']) => Promise<void>
}) {
  // TODO: Remove duplicate check of user and days loading
  if (days.loading || user.loading) return <>LOADING</>

  const lastDayIdx = days.data.findLastIndex(
    (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
  )
  if (lastDayIdx === /* TODO: Check if equality is a bug */ -1) {
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
        if (dayData !== undefined) {
          if (
            confirm(
              'Tem certeza que deseja excluir este dia e copiar o dia anterior?',
            )
          ) {
            // TODO: Avoid non-null assertion
            await deleteDay(dayData!.id)
          }
        }

        const lastDayIdx = days.data.findLastIndex(
          (day) => Date.parse(day.target_day) < Date.parse(selectedDay),
        )
        if (lastDayIdx === /* TODO: Check if equality is a bug */ -1) {
          alert('Não foi possível encontrar um dia anterior')
          return
        }

        upsertDay({
          ...days.data[lastDayIdx],
          target_day: selectedDay,
          id: dayData?.id,
        }).then(() => {
          fetchDays(user.data.id)
        })
      }}
    >
      {/* //TODO: retriggered: copiar qualquer dia */}
      Copiar dia anterior ({days.data[lastDayIdx].target_day})
    </button>
  )
}
