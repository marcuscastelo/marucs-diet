'use client'

import { Day } from '@/model/dayModel'
import CreateBlankDayButton from './CreateBlankDayButton'
import CopyLastDayButton from './CopyLastDayButton'
import { computed } from '@preact/signals-react'

export default function DayNotFound({
  selectedDay,
  refetchDays,
  days,
}: {
  selectedDay: string
  refetchDays: () => void
  days: Day[]
}) {
  return (
    <>
      <h1 className="mt-2" color="warning">
        Nenhum dado encontrado para o dia {selectedDay}
      </h1>
      <CreateBlankDayButton
        selectedDay={selectedDay}
        refetchDays={refetchDays}
      />
      <CopyLastDayButton
        day={computed(() => undefined)}
        days={computed(() => days)}
        refetchDays={refetchDays}
        selectedDay={selectedDay}
      />
    </>
  )
}
